package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	k8stypes "github.com/nimi-io/FlowCD/api/k8s"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type PipelinesHandler struct{ client client.Client }

func NewPipelinesHandler(c client.Client) *PipelinesHandler { return &PipelinesHandler{client: c} }

func (h *PipelinesHandler) Routes(r chi.Router) {
	r.Get("/", h.list)
	r.Get("/{id}", h.get)
}

func (h *PipelinesHandler) list(w http.ResponseWriter, r *http.Request) {
	list := &k8stypes.PipelineList{}
	if err := h.client.List(r.Context(), list); err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	resp := make([]PipelineResp, 0, len(list.Items))
	for _, p := range list.Items {
		resp = append(resp, toPipelineResp(&p))
	}
	jsonOK(w, resp)
}

func (h *PipelinesHandler) get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	pipeline := &k8stypes.Pipeline{}
	ns, name := "default", id
	if parts := strings.SplitN(id, "/", 2); len(parts) == 2 {
		ns, name = parts[0], parts[1]
	}
	if err := h.client.Get(r.Context(), client.ObjectKey{Namespace: ns, Name: name}, pipeline); err != nil {
		jsonError(w, "pipeline not found", http.StatusNotFound)
		return
	}
	jsonOK(w, toPipelineResp(pipeline))
}

func toPipelineResp(p *k8stypes.Pipeline) PipelineResp {
	id := string(p.UID)
	if id == "" {
		id = p.Name
	}
	lastRunAt := time.Time{}.UTC().Format(time.RFC3339)
	if p.Status.LastRunAt != nil {
		lastRunAt = p.Status.LastRunAt.UTC().Format(time.RFC3339)
	}
	stages := make([]PipelineStageResp, 0, len(p.Status.Stages))
	for _, s := range p.Status.Stages {
		stages = append(stages, PipelineStageResp{
			Name:   s.Name,
			Status: strings.ToLower(string(s.Phase)),
		})
	}
	return PipelineResp{
		ID:            id,
		Name:          p.Name,
		AppID:         p.Spec.AppRef,
		AppName:       p.Spec.AppRef,
		LastRunStatus: pipelinePhaseToStatus(p.Status.Phase),
		LastRunAt:     lastRunAt,
		Stages:        stages,
		Runs:          []PipelineRunResp{},
	}
}

func pipelinePhaseToStatus(phase k8stypes.PipelinePhase) string {
	switch phase {
	case k8stypes.PipelinePhaseRunning:
		return "running"
	case k8stypes.PipelinePhaseSucceeded:
		return "succeeded"
	case k8stypes.PipelinePhaseFailed:
		return "failed"
	default:
		return "pending"
	}
}
