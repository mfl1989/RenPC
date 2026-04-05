import { Outlet } from 'react-router-dom'
import { FormContextProvider } from '../../context/FormContextProvider.tsx'

/**
 * /apply 配下でフォーム状態を共有するラッパー
 */
export default function ApplyLayout() {
  return (
    <FormContextProvider>
      <Outlet />
    </FormContextProvider>
  )
}
