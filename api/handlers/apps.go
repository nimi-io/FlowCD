package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	k8stypes "github.com/nimi-io/FlowCD/api/k8s"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type AppsHandler struct{ client client.Client }

func NewAppsHandler(c client.Client) *AppsHandler { return &AppsHandler{client: c} }

func (h *AppsHandler) Routes(r chi.Router) {
	r.Get("/", h.list)
	r.Post("/", h.create)
	r.Get("/{id}", h.get)
	r.Delete("/{id}", h.delete)
	r.Post("/{id}/redeploy", h.redeploy)
	r.Get("/{id}/deployments", h.deployments)
	r.Get("/{id}/builds", h.builds)
	r.Get("/{id}/logs", h.logs)
}

func (h *AppsHandler) list(w http.ResponseWriter, r *http.Request) {
	list := &k8stypes.AppList{}
	if err := h.client.List(r.Context(), list, &client.ListOptions{}); err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	resp := make([]AppResp, 0, len(list.Items))
	for _, a := range list.Items {
		resp = append(resp, toAppResp(&a))
	}
	jsonOK(w, resp)
}

func (h *AppsHandler) get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	app, err := h.fetchApp(r.Context(), id)
	if err != nil {
		jsonError(w, err.Error(), http.StatusNotFound)
		return
	}
	jsonOK(w, toAppResp(app))
}

func (h *AppsHandler) create(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Name    string   `json:"name"`
		RepoUrl string   `json:"repoUrl"`
		Branch  string   `json:"branch"`
		Domains []string `json:"domains"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonError(w, "invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}
	if body.Name == "" || body.RepoUrl == "" {
		jsonError(w, "name and repoUrl are required", http.StatusBadRequest)
		return
	}
	branch := body.Branch
	if branch == "" {
		branch = "main"
	}
	app := &k8stypes.App{}
	app.Name = body.Name
	app.Namespace = "default"
	app.Spec.RepoUrl = body.RepoUrl
	app.Spec.Branch = branch
	app.Spec.Domains = body.Domains
	if err := h.client.Create(r.Context(), app); err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	jsonOK(w, toAppResp(app))
}

func (h *AppsHandler) delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	app, err := h.fetchApp(r.Context(), id)
	if err != nil {
		jsonError(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := h.client.Delete(r.Context(), app); err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *AppsHandler) redeploy(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	app, err := h.fetchApp(r.Context(), id)
	if err != nil {
		jsonError(w, err.Error(), http.StatusNotFound)
		return
	}
	// Trigger reconciliation by bumping a redeploy annotation.
	patch := client.MergeFrom(app.DeepCopy())
	if app.Annotations == nil {
		app.Annotations = map[string]string{}
	}
	app.Annotations["platform.flowcd.io/redeploy-at"] = time.Now().UTC().Format(time.RFC3339)
	if err := h.client.Patch(r.Context(), app, patch); err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonOK(w, map[string]string{"status": "redeployment triggered"})
}

func (h *AppsHandler) deployments(w http.ResponseWriter, r *http.Request) {
	jsonOK(w, []interface{}{})
}

func (h *AppsHandler) builds(w http.ResponseWriter, r *http.Request) {
	jsonOK(w, []interface{}{})
}

func (h *AppsHandler) logs(w http.ResponseWriter, r *http.Request) {
	jsonOK(w, []string{})
}

func (h *AppsHandler) fetchApp(ctx context.Context, nameOrNSN string) (*k8stypes.App, error) {
	app := &k8stypes.App{}
	// Support "namespace/name" or plain "name" (defaults to "default").
	ns, name := "default", nameOrNSN
	if parts := strings.SplitN(nameOrNSN, "/", 2); len(parts) == 2 {
		ns, name = parts[0], parts[1]
	}
	if err := h.client.Get(ctx, client.ObjectKey{Namespace: ns, Name: name}, app); err != nil {
		return nil, err
	}
	return app, nil
}

// ─── mapping ─────────────────────────────────────────────────────────────────

func toAppResp(a *k8stypes.App) AppResp {
	resp := AppResp{
		ID:               string(a.UID),
		Name:             a.Name,
		RepoUrl:          a.Spec.RepoUrl,
		Branch:           a.Spec.Branch,
		Status:           phaseToStatus(a.Status.Phase),
		LastDeployedAt:   timeOrZero((*time.Time)(nil)),
		LastBuildAt:      timeOrZero((*time.Time)(nil)),
		URL:              a.Status.URL,
		ImageTag:         a.Status.ImageTag,
		ArgoSyncStatus:   phaseToArgoSync(a.Status.Phase),
		ArgoHealthStatus: phaseToArgoHealth(a.Status.Phase),
		Domains:          make([]DomainResp, 0),
		EnvVars:          make([]EnvVarResp, 0),
	}
	if a.Status.LastDeployedAt != nil {
		resp.LastDeployedAt = a.Status.LastDeployedAt.UTC().Format(time.RFC3339)
		resp.LastBuildAt = resp.LastDeployedAt
	}
	// Map string UID if empty (not yet persisted).
	if resp.ID == "" {
		resp.ID = a.Name
	}
	for _, d := range a.Spec.Domains {
		resp.Domains = append(resp.Domains, DomainResp{
			ID:        d,
			Domain:    d,
			SslStatus: "pending",
		})
	}
	for i, e := range a.Spec.Env {
		resp.EnvVars = append(resp.EnvVars, EnvVarResp{
			ID:    a.Name + "-" + string(rune('a'+i)),
			Key:   e.Name,
			Value: e.Value,
		})
	}
	return resp
}

func phaseToStatus(phase k8stypes.AppPhase) string {
	switch phase {
	case k8stypes.AppPhaseHealthy:
		return "healthy"
	case k8stypes.AppPhaseBuilding:
		return "building"
	case k8stypes.AppPhaseDeploying:
		return "deploying"
	case k8stypes.AppPhaseDegraded, k8stypes.AppPhaseFailed:
		return "degraded"
	default:
		return "idle"
	}
}

func phaseToArgoSync(phase k8stypes.AppPhase) string {
	switch phase {
	case k8stypes.AppPhaseHealthy:
		return "Synced"
	case k8stypes.AppPhaseDeploying:
		return "Synced"
	default:
		return "Unknown"
	}
}

func phaseToArgoHealth(phase k8stypes.AppPhase) string {
	switch phase {
	case k8stypes.AppPhaseHealthy:
		return "Healthy"
	case k8stypes.AppPhaseDeploying:
		return "Progressing"
	case k8stypes.AppPhaseDegraded, k8stypes.AppPhaseFailed:
		return "Degraded"
	case k8stypes.AppPhaseSuspended:
		return "Suspended"
	default:
		return "Unknown"
	}
}

func timeOrZero(t *time.Time) string {
	if t == nil {
		return time.Time{}.UTC().Format(time.RFC3339)
	}
	return t.UTC().Format(time.RFC3339)
}
