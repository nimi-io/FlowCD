package k8s

import (
	"fmt"
	"os"

	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/serializer"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// NewClient builds a controller-runtime client that knows about the FlowCD CRDs.
func NewClient() (client.Client, error) {
	cfg, err := loadConfig()
	if err != nil {
		return nil, fmt.Errorf("load kubeconfig: %w", err)
	}

	scheme := runtime.NewScheme()
	if err := addToScheme(scheme); err != nil {
		return nil, fmt.Errorf("build scheme: %w", err)
	}

	c, err := client.New(cfg, client.Options{Scheme: scheme})
	if err != nil {
		return nil, fmt.Errorf("create k8s client: %w", err)
	}
	return c, nil
}

func loadConfig() (*rest.Config, error) {
	// Try in-cluster config first.
	cfg, err := rest.InClusterConfig()
	if err == nil {
		return cfg, nil
	}
	// Fall back to KUBECONFIG or ~/.kube/config.
	kubeconfig := os.Getenv("KUBECONFIG")
	if kubeconfig == "" {
		kubeconfig = clientcmd.RecommendedHomeFile
	}
	return clientcmd.BuildConfigFromFlags("", kubeconfig)
}

func addToScheme(scheme *runtime.Scheme) error {
	// Register core k8s types needed for status conditions.
	scheme.AddKnownTypeWithName(
		GroupVersion.WithKind("App"),
		&App{},
	)
	scheme.AddKnownTypeWithName(
		GroupVersion.WithKind("AppList"),
		&AppList{},
	)
	scheme.AddKnownTypeWithName(
		GroupVersion.WithKind("Pipeline"),
		&Pipeline{},
	)
	scheme.AddKnownTypeWithName(
		GroupVersion.WithKind("PipelineList"),
		&PipelineList{},
	)

	// Register with the codec factory.
	_ = serializer.NewCodecFactory(scheme)
	return nil
}
