import SimpleContentPage from './SimpleContentPage.tsx'

export default function CollectionFlowPage() {
  return (
    <SimpleContentPage
      eyebrow="ご利用ガイド"
      title="宅配回収の流れ"
      lead="お申し込みから回収完了までの流れを簡単にまとめています。正式公開時は、受付締切、対応地域、集荷条件などの実運用情報を追加してください。"
      sections={[
        {
          title: '1. Web フォームからお申し込み',
          body: [
            '回収する台数、希望日、お客様情報を入力してお申し込みください。受付後、確認用の情報をメールでお知らせします。',
          ],
        },
        {
          title: '2. 梱包の準備',
          body: [
            '回収する機器を段ボールに梱包してください。付属品やケーブルを同梱する場合は、破損しないよう緩衝材をご利用ください。',
          ],
        },
        {
          title: '3. 集荷・受付完了',
          body: [
            'ご指定日時に宅配業者が訪問し、玄関先でお預かりします。到着後は受付状況に応じて順次ご案内します。',
          ],
        },
      ]}
    />
  )
}