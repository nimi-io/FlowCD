package handlers

import (
	"net/http"
	"time"
)

type SettingsHandler struct{}

func NewSettingsHandler() *SettingsHandler { return &SettingsHandler{} }

func (h *SettingsHandler) Team(w http.ResponseWriter, _ *http.Request) {
	jsonOK(w, []TeamMemberResp{
		{
			ID:       "1",
			Name:     "Admin",
			Email:    "admin@flowcd.io",
			Role:     "Admin",
			JoinedAt: time.Now().UTC().Format(time.RFC3339),
		},
	})
}

func (h *SettingsHandler) General(w http.ResponseWriter, _ *http.Request) {
	jsonOK(w, GeneralSettingsResp{
		PlatformName:        "FlowCD",
		DefaultRegion:       "us-east-1",
		DefaultBuildTimeout: 600,
	})
}

func (h *SettingsHandler) Credentials(w http.ResponseWriter, _ *http.Request) {
	jsonOK(w, []CredentialResp{})
}

func (h *SettingsHandler) Integrations(w http.ResponseWriter, _ *http.Request) {
	jsonOK(w, []IntegrationResp{
		{ID: "1", Name: "GitHub", Type: "github", Connected: false},
		{ID: "2", Name: "OCI Registry", Type: "oci_registry", Connected: false},
	})
}

func (h *SettingsHandler) Notifications(w http.ResponseWriter, _ *http.Request) {
	jsonOK(w, []NotificationRuleResp{
		{ID: "1", Event: "deploy_success", Channel: "email", Enabled: true},
		{ID: "2", Event: "deploy_fail", Channel: "email", Enabled: true},
		{ID: "3", Event: "build_fail", Channel: "email", Enabled: true},
	})
}
