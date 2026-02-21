import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import LoginPage from "@/pages/login/index";
import AppsPage from "@/pages/apps/index";
import NewAppPage from "@/pages/apps/new/index";
import AppLayout from "@/pages/apps/[id]/layout";
import AppOverviewPage from "@/pages/apps/[id]/index";
import DeploymentsPage from "@/pages/apps/[id]/deployments";
import BuildsPage from "@/pages/apps/[id]/builds";
import LogsPage from "@/pages/apps/[id]/logs";
import EnvPage from "@/pages/apps/[id]/env";
import DomainsPage from "@/pages/apps/[id]/domains";
import AppSettingsPage from "@/pages/apps/[id]/settings";
import ClustersPage from "@/pages/clusters/index";
import ClusterDetailPage from "@/pages/clusters/[id]";
import PipelinesPage from "@/pages/pipelines/index";
import PipelineDetailPage from "@/pages/pipelines/[id]";
import ActivityPage from "@/pages/activity/index";
import SettingsLayout from "@/pages/settings/layout";
import GeneralSettingsPage from "@/pages/settings/general";
import TeamSettingsPage from "@/pages/settings/team";
import IntegrationsPage from "@/pages/settings/integrations";
import CredentialsPage from "@/pages/settings/credentials";
import NotificationsPage from "@/pages/settings/notifications";
import NotFound from "@/pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/apps" replace />} />
          <Route path="/apps" element={<AppsPage />} />
          <Route path="/apps/new" element={<NewAppPage />} />
          <Route path="/apps/:id" element={<AppLayout />}>
            <Route index element={<AppOverviewPage />} />
            <Route path="deployments" element={<DeploymentsPage />} />
            <Route path="builds" element={<BuildsPage />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="env" element={<EnvPage />} />
            <Route path="domains" element={<DomainsPage />} />
            <Route path="settings" element={<AppSettingsPage />} />
          </Route>
          <Route path="/clusters" element={<ClustersPage />} />
          <Route path="/clusters/:id" element={<ClusterDetailPage />} />
          <Route path="/pipelines" element={<PipelinesPage />} />
          <Route path="/pipelines/:id" element={<PipelineDetailPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="/settings/general" replace />} />
            <Route path="general" element={<GeneralSettingsPage />} />
            <Route path="team" element={<TeamSettingsPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="credentials" element={<CredentialsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
