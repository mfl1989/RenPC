import SimpleContentPage from './SimpleContentPage.tsx'

export default function PackingGuidePage() {
  return (
    <SimpleContentPage
      eyebrow="ご利用ガイド"
      title="梱包方法"
      lead="安全に回収するための簡易梱包ガイドです。正式運用時はサイズ制限、重量上限、同梱可能な付属品などを明確に案内してください。"
      sections={[
        {
          title: '段ボールの準備',
          body: [
            'お手持ちの段ボールをご利用いただけます。箱の底をしっかり固定し、輸送中に開かないようテープで補強してください。',
          ],
        },
        {
          title: '機器の保護',
          body: [
            'パソコンやモニターは、新聞紙や緩衝材で包んでから箱へ入れてください。箱の中で機器が動かないよう、すき間も埋めてください。',
          ],
        },
        {
          title: '発送前の確認',
          body: [
            'データ消去、付属品の入れ忘れ、申し込み内容との相違がないかをご確認ください。配送伝票や受付番号は回収完了まで保管してください。',
          ],
        },
      ]}
    />
  )
}