import SimpleContentPage from './SimpleContentPage.tsx'

export default function CompanyPage() {
  return (
    <SimpleContentPage
      eyebrow="会社情報"
      title="会社概要"
      lead="このページはデモ用の簡易会社情報です。正式公開時は法人名、所在地、連絡先、認定番号などの実データへ差し替えてください。"
      sections={[
        {
          title: '事業内容',
          body: [
            'Recycle PC は、宅配便を利用したパソコン回収サービスを想定したデモサイトです。個人のお客様から不要になったパソコンや周辺機器を回収し、再資源化や適正処理につなげる流れを表現しています。',
          ],
        },
        {
          title: '運営情報',
          body: [
            '正式版では、会社名、所在地、電話番号、メールアドレス、受付時間、認定事業者情報などをここに掲載します。',
            'お問い合わせ先と受付方法は、利用規約および個人情報保護方針とあわせて確認できる構成を想定しています。',
          ],
        },
      ]}
    />
  )
}