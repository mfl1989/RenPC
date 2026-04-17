import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.tsx'

const AdminInquiryList = lazy(() => import('./pages/admin/AdminInquiryList.tsx'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.tsx'))
const AdminOrderList = lazy(() => import('./pages/admin/AdminOrderList.tsx'))
const ApplyComplete = lazy(() => import('./pages/apply/ApplyComplete.tsx'))
const ApplyLayout = lazy(() => import('./pages/apply/ApplyLayout.tsx'))
const Step1Items = lazy(() => import('./pages/apply/Step1Items.tsx'))
const Step2Schedule = lazy(() => import('./pages/apply/Step2Schedule.tsx'))
const Step3Customer = lazy(() => import('./pages/apply/Step3Customer.tsx'))
const Step4Confirm = lazy(() => import('./pages/apply/Step4Confirm.tsx'))
const CollectionFlowPage = lazy(() => import('./pages/CollectionFlowPage.tsx'))
const CompanyPage = lazy(() => import('./pages/CompanyPage.tsx'))
const ContactPage = lazy(() => import('./pages/ContactPage.tsx'))
const LandingPage = lazy(() => import('./pages/LandingPage.tsx'))
const OrderLookupPage = lazy(() => import('./pages/OrderLookupPage.tsx'))
const PackingGuidePage = lazy(() => import('./pages/PackingGuidePage.tsx'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.tsx'))
const TermsPage = lazy(() => import('./pages/TermsPage.tsx'))

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
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
          <Route path="inquiries" element={<AdminInquiryList />} />
          <Route path="*" element={<Navigate to="/admin/orders" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
