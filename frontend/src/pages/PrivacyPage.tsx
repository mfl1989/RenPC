import SimpleContentPage from './SimpleContentPage.tsx'

export default function PrivacyPage() {
  return (
    <SimpleContentPage
      eyebrow="個人情報保護"
      title="個人情報保護方針"
      lead="このページはデモ用の簡易ポリシーです。実際の公開時には、取得項目、利用目的、第三者提供、保管期間、開示請求窓口などを明記してください。"
      sections={[
        {
          title: '取得する情報',
          body: [
            '氏名、住所、電話番号、メールアドレス、回収対象品目、申込履歴など、お申し込みと連絡に必要な情報を取得します。',
          ],
        },
        {
          title: '利用目的',
          body: [
            '回収受付、本人確認、配送手配、進行状況のご案内、お問い合わせ対応、サービス改善のために利用します。',
          ],
        },
        {
          title: '安全管理',
          body: [
            '取得した個人情報は、適切なアクセス管理と保管ルールのもとで取り扱います。委託先を利用する場合も、必要な管理監督を行います。',
          ],
        },
      ]}
    />
  )
}