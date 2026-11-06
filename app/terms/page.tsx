import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/features/legal/LegalPage';

export const metadata: Metadata = { title: 'Terms of Use · Misa' };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <p>
        <strong>In short:</strong>{' '}Misa helps you keep your books, but you stay responsible for your business and for
        checking your figures.
      </p>
      <p>
        By creating an account or using Misa on WhatsApp, you agree to these terms and to our{' '}
        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </p>

      <h2>What Misa is</h2>
      <p>
        Misa is an assistant that records your sales, expenses, stock and debts from your messages, voice notes, photos and
        files, and gives you summaries, reminders and reports. Misa is not a bank, an accountant or a tax adviser, and does
        not hold or move money.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You must be 18 or older and running, or working for, a business.</li>
        <li>Give a phone number and email that are yours. Misa sends your business information to the WhatsApp number on your account.</li>
        <li>Keep your password and PINs secret. You are responsible for what is done with your account.</li>
        <li>Tell us at once if you think someone else has used it.</li>
      </ul>

      <h2>Your staff</h2>
      <p>
        You can add staff and choose what each one may do. You are responsible for the staff you add, for what they record,
        and for removing them when they leave. Staff use your account under these terms.
      </p>

      <h2>Misa can make mistakes</h2>
      <p>Misa uses AI to read messages, voice notes and photos. It can misread an amount, an item or a name.</p>
      <ul>
        <li><strong>Check what Misa saved,</strong> especially before you rely on a total, pay someone or make a decision.</li>
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

      <h2>Free use, plans and credits</h2>
      <p>
        Misa is free to use during the pilot. We will tell you at least [14 days] before any charge starts, and nothing is
        charged without your OK. When paid use starts, these rules apply:
      </p>
      <ul>
        <li>You buy <strong>credits</strong> with naira, and Misa uses credits as you use it. The price of credits is shown before you pay.</li>
        <li>
          <strong>Credits are never exchanged for cash, sold or transferred.</strong> Unused credits stay in your account. If
          Misa fails to give you the service you used credits for, we give the credits back. If you paid but the credits never
          arrived, or you were charged twice, your payment is reversed, as with a failed airtime top-up.
        </li>
        <li>Free credits Misa gives you may expire, and we will say when.</li>
        <li>Payments go through a licensed payment provider. We never see or store your card details.</li>
        <li>If we stop Misa for good, we will give at least [30 days&apos;] notice.</li>
      </ul>

      <h2>Our part</h2>
      <p>
        We will try to keep Misa running and your records safe, but we can&apos;t promise it will always be available or
        error-free. WhatsApp, the internet, AI services and other providers can fail.
      </p>

      <h2>Pausing or closing accounts</h2>
      <p>
        You can stop using Misa at any time and ask us to delete your account (see the Privacy Policy). We may pause or close
        an account that breaks these terms or the law, or puts others at risk. Where we can, we will warn you first and let
        you take a copy of your records.
      </p>

      <h2>Limits on our responsibility</h2>
      <p>As far as the law allows:</p>
      <ul>
        <li>we are not responsible for losses that come from a wrong figure you didn&apos;t check, from what your staff did, or from a service outside our control failing;</li>
        <li>we are not responsible for lost profit or indirect losses;</li>
        <li>our total responsibility to you is limited to [the amount you paid us in the 12 months before the claim, or N50,000 if more].</li>
      </ul>
      <p>Nothing here limits rights you have under Nigerian consumer protection law that can&apos;t be limited.</p>

      <h2>Law and disputes</h2>
      <p>
        These terms are governed by the laws of the Federal Republic of Nigeria. We will first try to settle any dispute with
        you directly. If we can&apos;t, it goes to the courts of [Lagos State].
      </p>

      <h2>Changes to these terms</h2>
      <p>
        If we change these terms in a way that matters, we will tell you on WhatsApp or in the app at least [14 days] before.
        If you keep using Misa after that, the new terms apply.
      </p>

      <h2>Contact</h2>
      <p>[Company legal name], [address]. Email: [support email].</p>
    </LegalPage>
  );
}
