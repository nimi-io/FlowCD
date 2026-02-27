package v1alpha1

import (
	"context"
	"fmt"
	"net/url"
	"strings"

	"k8s.io/apimachinery/pkg/util/validation"
	ctrl "sigs.k8s.io/controller-runtime"
	logf "sigs.k8s.io/controller-runtime/pkg/log"
	"sigs.k8s.io/controller-runtime/pkg/webhook/admission"

	platformv1alpha1 "github.com/nimi-io/FlowCD/operator/api/v1alpha1"
)

var appWebhookLog = logf.Log.WithName("app-webhook")

// SetupAppWebhookWithManager registers the defaulting and validating webhooks
// for the App kind.
func SetupAppWebhookWithManager(mgr ctrl.Manager) error {
	return ctrl.NewWebhookManagedBy(mgr, &platformv1alpha1.App{}).
		WithDefaulter(&AppDefaulter{}).
		WithValidator(&AppValidator{}).
		Complete()
}

// ─── Defaulter ───────────────────────────────────────────────────────────────

// AppDefaulter applies defaulting logic to App resources.
// +kubebuilder:webhook:path=/mutate-platform-flowcd-io-v1alpha1-app,mutating=true,failurePolicy=fail,sideEffects=None,groups=platform.flowcd.io,resources=apps,verbs=create;update,versions=v1alpha1,name=mapp.kb.io,admissionReviewVersions=v1
type AppDefaulter struct{}

var _ admission.Defaulter[*platformv1alpha1.App] = &AppDefaulter{}

func (d *AppDefaulter) Default(_ context.Context, app *platformv1alpha1.App) error {
	appWebhookLog.Info("Defaulting App", "name", app.Name)
	if app.Spec.Branch == "" {
		app.Spec.Branch = "main"
	}
	if app.Spec.Port == 0 {
		app.Spec.Port = 8080
	}
	if app.Spec.Replicas == nil {
		one := int32(1)
		app.Spec.Replicas = &one
	}
	return nil
}

// ─── Validator ───────────────────────────────────────────────────────────────

// AppValidator validates App resources on create and update.
// +kubebuilder:webhook:path=/validate-platform-flowcd-io-v1alpha1-app,mutating=false,failurePolicy=fail,sideEffects=None,groups=platform.flowcd.io,resources=apps,verbs=create;update,versions=v1alpha1,name=vapp.kb.io,admissionReviewVersions=v1
type AppValidator struct{}

var _ admission.Validator[*platformv1alpha1.App] = &AppValidator{}

func (v *AppValidator) ValidateCreate(_ context.Context, app *platformv1alpha1.App) (admission.Warnings, error) {
	appWebhookLog.Info("Validating App create", "name", app.Name)
	return nil, validateApp(app)
}

func (v *AppValidator) ValidateUpdate(_ context.Context, oldApp, newApp *platformv1alpha1.App) (admission.Warnings, error) {
	appWebhookLog.Info("Validating App update", "name", newApp.Name)
	if oldApp.Spec.RepoUrl != "" && newApp.Spec.RepoUrl != oldApp.Spec.RepoUrl {
		return nil, fmt.Errorf("spec.repoUrl is immutable")
	}
	return nil, validateApp(newApp)
}

func (v *AppValidator) ValidateDelete(_ context.Context, _ *platformv1alpha1.App) (admission.Warnings, error) {
	return nil, nil
}

// ─── shared validation logic ─────────────────────────────────────────────────

func validateApp(app *platformv1alpha1.App) error {
	var errs []string
	if app.Spec.RepoUrl != "" {
		if _, err := url.ParseRequestURI(app.Spec.RepoUrl); err != nil {
			errs = append(errs, fmt.Sprintf("spec.repoUrl %q is not a valid URL: %v", app.Spec.RepoUrl, err))
		}
	}
	for _, domain := range app.Spec.Domains {
		if msgs := validation.IsDNS1123Subdomain(domain); len(msgs) > 0 {
			errs = append(errs, fmt.Sprintf("spec.domains: %q invalid: %s", domain, strings.Join(msgs, ", ")))
		}
	}
	if app.Spec.Replicas != nil && *app.Spec.Replicas < 0 {
		errs = append(errs, "spec.replicas must be >= 0")
	}
	if len(errs) > 0 {
		return fmt.Errorf("App %q failed validation: %s", app.Name, strings.Join(errs, "; "))
	}
	return nil
}
