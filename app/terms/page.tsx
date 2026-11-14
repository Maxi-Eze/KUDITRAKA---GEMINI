import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/features/legal/LegalPage';

export const metadata: Metadata = { title: 'Terms of Use · Misa' };

/** Text approved by the lawyer (Nov 2026). Source: the legal doc linked in lib/legal.ts. */
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <p><strong>In short:</strong>{' '}Misa helps you keep your books, but you stay responsible for your business and for checking your figures.</p>

      <p>By creating an account or using Misa on WhatsApp, you agree to these terms and to the <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> above.</p>

      <h2>What Misa is</h2>

      <p>Misa is an assistant that records your sales, expenses, stock and debts from your messages, voice notes, photos and files, and gives you summaries, reminders and reports. Misa is not a bank, an accountant or a tax adviser, and does not hold or move money.</p>

      <h2>Your account</h2>

      <ul>
        <li>You must be 18 or older and running, or working for, a business.</li>
        <li>Give a phone number and email that are yours. Misa sends your business information to the WhatsApp number on your account.</li>
        <li>Keep your password and PINs secret. You are responsible for what is done with your account.</li>
        <li>Tell us at once if you think someone else has used it.</li>
      </ul>

      <h2>Your staff</h2>

      <p>You can add staff and choose what each one may do. You are responsible for the staff you add, for what they record, and for removing them when they leave. Staff use your account under these terms.</p>

      <h2>Your customers&apos; data</h2>

      <p>When you save your customers&apos; names, phone numbers or debts in Misa, you are responsible for that information under the NDPA, and we keep it for you on your instructions. We will:</p>

      <ul>
        <li>use it only to provide Misa to you;</li>
        <li>keep it secure and confidential;</li>
        <li>share it only with the services listed in the <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>;</li>
        <li>help you if a customer asks to see, correct or delete their details;</li>
        <li>delete it when you delete it or close your account.</li>
      </ul>

      <p>You agree to save only what you need, and to let your customers know you keep a record of what they owe in Misa.</p>

      <h2>Misa can make mistakes</h2>

      <p>Misa uses AI to read messages, voice notes and photos. It can misread an amount, an item or a name.</p>

      <ul>
        <li><strong>Check what Misa saved,</strong>{' '}especially before you rely on a total, pay someone or make a decision.</li>
        <li>Summaries, tips and the weekly check-up are <strong>general information, not financial, tax or legal advice.</strong></li>
        <li>Your records are only as complete as what you tell Misa.</li>
      </ul>

      <h2>Using Misa fairly</h2>

      <p>Don&apos;t use Misa to:</p>

      <ul>
        <li>record anything illegal, or to deceive a lender, partner, tax office or anyone else;</li>
        <li>save data about people you have no right to keep;</li>
        <li>send spam, or harass anyone, including through debt reminders;</li>
        <li>try to get into other people&apos;s accounts, overload the service, or copy or resell it.</li>
      </ul>

      <h2>Credits</h2>

      <p>Misa works on prepaid credits, like airtime. If you were using Misa before we started charging, we tell you before charging starts; if you join after that, these rules apply from the start. You only ever spend credits you have bought or been given. Then these rules apply:</p>

      <ul>
        <li><strong>Credits.</strong>{' '}You buy credits in naira: ₦1 buys 1 credit. Each thing Misa does for you uses a few credits, for example recording a sale, an expense or a restock, reading an invoice, or answering a question. The current prices are in the app, and Misa usually asks first before anything that uses a lot of credits.</li>
        <li><strong>Paying.</strong>{' '}You pay through Paystack, a licensed payment provider. You pay by bank transfer into a one-time account number shown on the website or sent to you on WhatsApp. The amount you pay includes the payment fees, and we show it before you pay. Your credits are added once the money arrives. We never see your bank login or PIN.</li>
        <li><strong>No cash-out.</strong>{' '}Credits are never exchanged for cash, sold or transferred, like airtime. Unused credits stay in your account until they expire (see below).</li>
        <li><strong>When something goes wrong.</strong>{' '}If an action doesn&apos;t complete because of a fault on our side, we return the credits it used, if you tell us within 30 days. A figure Misa read wrongly that you can correct is not a fault. If you paid but the credits never arrived, or you were charged twice, your payment is reversed.</li>
        <li><strong>Deleted records.</strong>{' '}Deleting or changing a record you made does not give back the credits it used.</li>
        <li><strong>Running out.</strong>{' '}When your credits run out, Misa still records your next 5 records on credit, and your next top-up pays for them first. After that, Misa stops recording new entries until you top up. We don&apos;t delete your records because your credits ran out, and you can still see them.</li>
        <li><strong>Your staff.</strong>{' '}What your staff do in Misa uses your business&apos;s credits. You can see who used how many on the Credits page.</li>
        <li><strong>When credits expire.</strong>{' '}New businesses get 1,000 free credits. Free credits must be used within 40 days, and paid credits within 6 months of buying them. Misa reminds you 7 days before any credits expire. Expired credits are not given back.</li>
        <li><strong>Free credits.</strong>{' '}Each business gets free credits once. If we find accounts opened to collect free credits again, we may remove those credits or close those accounts.</li>
        <li><strong>Reversed payments.</strong>{' '}If a payment is reversed, recalled or charged back by your bank or by Paystack, we remove the credits it bought. If those credits were already used, the balance can go below zero until you top up.</li>
        <li><strong>No refunds.</strong>{' '}We don&apos;t refund money for credits you have used or that have expired. If we close your account because you broke these terms or the law, any credits left on it are lost.</li>
        <li><strong>Price changes.</strong>{' '}If we change the price of credits, we tell you at least 14 days before. Credits you already bought keep their value.</li>
        <li><strong>If Misa closes.</strong>{' '}If we stop Misa for good, we will give at least 30 days&apos; notice, and you can keep using your remaining credits during that time.</li>
      </ul>

      <h2>Misa Loans</h2>

      <p>Seeing your progress towards Misa Loans in the app is not an offer or a promise of a loan. Any loan, if one is ever offered to you, comes with its own terms, and we or our partners decide whether to offer it.</p>

      <h2>If someone makes a claim against us</h2>

      <p>You are responsible for everything you and your staff record, upload or send through Misa, including your customers&apos; names, phone numbers and debts, and any reminder you send them.</p>

      <p>If anyone (a customer, a staff member, a lender, a government body or anyone else) makes a claim, complaint or demand against KUDITRAKA TECHNOLOGIES.AI, its directors, staff or partners because of:</p>

      <ul>
        <li>information you or your staff recorded, uploaded or sent through Misa;</li>
        <li>how you collected, used or shared your customers&apos; details, or how you contacted them about a debt;</li>
        <li>your staff&apos;s actions while using your account;</li>
        <li>you or your staff breaking these terms or any law,</li>
      </ul>

      <p>you will, if we ask, defend us against it, and you will pay all losses, fines, penalties, settlements and reasonable costs, including legal fees, that we incur because of it. We will tell you about the claim, and we may choose to handle it ourselves at your cost. You may not settle a claim in our name without our written agreement. This continues to apply after your account is closed.</p>

      <h2>Our part</h2>

      <p>We will try to keep Misa running and your records safe, but we can&apos;t promise it will always be available or error-free. WhatsApp, the internet, AI services and other providers can fail.</p>

      <h2>Pausing or closing accounts</h2>

      <p>You can stop using Misa at any time and ask us to delete your account (see the <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>). We may pause or close an account that breaks these terms or the law, or puts others at risk. Where we can, we will warn you first and let you take a copy of your records.</p>

      <h2>Limits on our responsibility</h2>

      <p>As far as the law allows:</p>

      <ul>
        <li>we are not responsible for losses that come from a wrong figure you didn&apos;t check, from what your staff did, or from a service outside our control failing;</li>
        <li>we are not responsible for lost profit or indirect losses;</li>
        <li>our total responsibility to you is limited to the amount we actually received from you for credits in the 12 months before the claim, and never more than ₦50,000. If we received nothing from you in that time, we owe you nothing beyond returning credits as set out under Credits.</li>
      </ul>

      <p>Nothing here limits rights you have under Nigerian consumer protection law that can&apos;t be limited.</p>

      <h2>Law and disputes</h2>

      <p>These terms are governed by the laws of the Federal Republic of Nigeria. We will first try to settle any dispute with you directly. If we can&apos;t, it goes to the courts of Lagos State.</p>

      <h2>Changes to these terms</h2>

      <p>If we change these terms in a way that matters, we will tell you on WhatsApp or in the app at least 14 days before. If you keep using Misa after that, the new terms apply.</p>

      <h2>Contact</h2>

      <p>KUDITRAKA TECHNOLOGIES.AI, Gbagada, Lagos. Email: <a href="mailto:kuditraka.ai@gmail.com" className="text-primary hover:underline">kuditraka.ai@gmail.com</a>.</p>
    </LegalPage>
  );
}
