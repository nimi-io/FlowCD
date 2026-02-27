package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// jwtSecret is loaded from the JWT_SECRET env var, with a default for development.
var jwtSecret = func() []byte {
	if s := os.Getenv("JWT_SECRET"); s != "" {
		return []byte(s)
	}
	return []byte("flowcd-dev-secret-change-in-production")
}()

// adminEmail / adminPassword are the single-user credentials.
// In production, set AUTH_EMAIL and AUTH_PASSWORD env vars.
var adminEmail = func() string {
	if e := os.Getenv("AUTH_EMAIL"); e != "" {
		return e
	}
	return "admin@flowcd.io"
}()

var adminPassword = func() string {
	if p := os.Getenv("AUTH_PASSWORD"); p != "" {
		return p
	}
	return "flowcd"
}()

// contextKey is the type used for context keys in this package.
type contextKey string

const contextKeyEmail contextKey = "email"

// ─── Handler ─────────────────────────────────────────────────────────────────

type AuthHandler struct{}

func NewAuthHandler() *AuthHandler { return &AuthHandler{} }

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginResponse struct {
	Token string `json:"token"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Email != adminEmail || req.Password != adminPassword {
		jsonError(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	claims := jwt.MapClaims{
		"sub":  req.Email,
		"name": "Admin",
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
		"iat":  time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(jwtSecret)
	if err != nil {
		jsonError(w, "failed to sign token", http.StatusInternalServerError)
		return
	}
	jsonOK(w, loginResponse{Token: signed, Email: req.Email, Name: "Admin"})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	email, _ := r.Context().Value(contextKeyEmail).(string)
	if email == "" {
		jsonError(w, "not authenticated", http.StatusUnauthorized)
		return
	}
	jsonOK(w, map[string]string{"email": email, "name": "Admin"})
}

// ─── Middleware ───────────────────────────────────────────────────────────────

// ValidateJWT is middleware that requires a valid Bearer JWT on all requests.
func ValidateJWT(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			jsonError(w, "missing or invalid Authorization header", http.StatusUnauthorized)
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return jwtSecret, nil
		})
		if err != nil || !token.Valid {
			jsonError(w, "invalid or expired token", http.StatusUnauthorized)
			return
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			jsonError(w, "invalid token claims", http.StatusUnauthorized)
			return
		}
		email, _ := claims["sub"].(string)
		ctx := context.WithValue(r.Context(), contextKeyEmail, email)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
