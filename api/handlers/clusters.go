package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type ClustersHandler struct{}

func NewClustersHandler() *ClustersHandler { return &ClustersHandler{} }

func (h *ClustersHandler) Routes(r chi.Router) {
	r.Get("/", h.list)
	r.Get("/{id}", h.get)
}

var stubCluster = ClusterResp{
	ID:         "local",
	Name:       "local-cluster",
	Provider:   "Bare Metal",
	NodeCount:  1,
	Health:     "healthy",
	K8sVersion: "v1.30.0",
	Region:     "local",
	Nodes: []ClusterNodeResp{
		{Name: "node-1", CPU: 20, Memory: 35, Status: "Ready"},
	},
	Namespaces: []NamespaceResp{
		{Name: "default", Status: "Active", PodCount: 0, CPURequest: "0m", MemRequest: "0Mi"},
	},
}

func (h *ClustersHandler) list(w http.ResponseWriter, _ *http.Request) {
	jsonOK(w, []ClusterResp{stubCluster})
}

func (h *ClustersHandler) get(w http.ResponseWriter, r *http.Request) {
	if chi.URLParam(r, "id") == stubCluster.ID {
		jsonOK(w, stubCluster)
		return
	}
	jsonError(w, "cluster not found", http.StatusNotFound)
}
