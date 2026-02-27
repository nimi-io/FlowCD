package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/nimi-io/FlowCD/api/handlers"
	"github.com/nimi-io/FlowCD/api/k8s"
)

func main() {
	k8sClient, err := k8s.NewClient()
	if err != nil {
		log.Fatalf("failed to create kubernetes client: %v", err)
	}

	appsH := handlers.NewAppsHandler(k8sClient)
	pipelinesH := handlers.NewPipelinesHandler(k8sClient)
	clustersH := handlers.NewClustersHandler()
	activityH := handlers.NewActivityHandler()
	settingsH := handlers.NewSettingsHandler()
	authH := handlers.NewAuthHandler()

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Route("/api", func(api chi.Router) {
		// Public: login endpoint (no auth required).
		api.Post("/auth/login", authH.Login)

		// Protected routes — all require a valid Bearer JWT.
		api.Group(func(protected chi.Router) {
			protected.Use(handlers.ValidateJWT)

			protected.Get("/auth/me", authH.Me)

			protected.Route("/apps", appsH.Routes)
			protected.Route("/pipelines", pipelinesH.Routes)
			protected.Route("/clusters", clustersH.Routes)
			protected.Get("/activity", activityH.List)

			protected.Route("/settings", func(s chi.Router) {
				s.Get("/team", settingsH.Team)
				s.Get("/general", settingsH.General)
				s.Get("/credentials", settingsH.Credentials)
				s.Get("/integrations", settingsH.Integrations)
				s.Get("/notifications", settingsH.Notifications)
			})
		})
	})

	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintln(w, "ok")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8090"
	}

	log.Printf("FlowCD API server listening on :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
