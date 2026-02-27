package handlers

import (
	"net/http"
	"time"
)

type ActivityHandler struct{}

func NewActivityHandler() *ActivityHandler { return &ActivityHandler{} }

func (h *ActivityHandler) List(w http.ResponseWriter, _ *http.Request) {
	jsonOK(w, ActivityPageResp{
		Events: []ActivityEventResp{
			{
				ID:        "1",
				Type:      "cluster_event",
				Message:   "FlowCD operator started",
				Actor:     "system",
				Timestamp: time.Now().UTC().Format(time.RFC3339),
			},
		},
		HasMore: false,
	})
}
