import { Navigate, Route, Routes } from 'react-router-dom'
import AdminOrderList from './pages/admin/AdminOrderList.tsx'
import LandingPage from './pages/LandingPage.tsx'
import ApplyLayout from './pages/apply/ApplyLayout.tsx'
import Step1Items from './pages/apply/Step1Items.tsx'
import Step2Schedule from './pages/apply/Step2Schedule.tsx'
import Step3Customer from './pages/apply/Step3Customer.tsx'
import ApplyComplete from './pages/apply/ApplyComplete.tsx'
import Step4Confirm from './pages/apply/Step4Confirm.tsx'

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
      <Route path="/admin/orders" element={<AdminOrderList />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
