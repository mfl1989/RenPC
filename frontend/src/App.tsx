import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import AdminLogin from './pages/admin/AdminLogin.tsx'
import AdminOrderList from './pages/admin/AdminOrderList.tsx'
import ApplyComplete from './pages/apply/ApplyComplete.tsx'
import ApplyLayout from './pages/apply/ApplyLayout.tsx'
import Step1Items from './pages/apply/Step1Items.tsx'
import Step2Schedule from './pages/apply/Step2Schedule.tsx'
import Step3Customer from './pages/apply/Step3Customer.tsx'
import Step4Confirm from './pages/apply/Step4Confirm.tsx'
import CollectionFlowPage from './pages/CollectionFlowPage.tsx'
import CompanyPage from './pages/CompanyPage.tsx'
import ContactPage from './pages/ContactPage.tsx'
import LandingPage from './pages/LandingPage.tsx'
import OrderLookupPage from './pages/OrderLookupPage.tsx'
import PackingGuidePage from './pages/PackingGuidePage.tsx'
import PrivacyPage from './pages/PrivacyPage.tsx'
import TermsPage from './pages/TermsPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/apply" element={<ApplyLayout />}>
        <Route index element={<Navigate to="step1" replace />} />
        <Route path="step1" element={<Step1Items />} />
        <Route path="step2" element={<Step2Schedule />} />
        <Route path="step3" element={<Step3Customer />} />
        <Route path="step4" element={<Step4Confirm />} />
        <Route path="complete" element={<ApplyComplete />} />
      </Route>
      <Route path="/orders/lookup" element={<OrderLookupPage />} />
      <Route path="/company" element={<CompanyPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/guide/flow" element={<CollectionFlowPage />} />
      <Route path="/guide/packing" element={<PackingGuidePage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route path="orders" element={<AdminOrderList />} />
        <Route path="*" element={<Navigate to="/admin/orders" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
