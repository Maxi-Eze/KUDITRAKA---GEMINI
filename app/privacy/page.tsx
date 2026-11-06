import type { Metadata } from 'next';
import { LegalPage, LegalTable } from '@/components/features/legal/LegalPage';

export const metadata: Metadata = { title: 'Privacy Policy · Misa' };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        <strong>In short:</strong>{' '}Misa keeps your business records so it can do your books for you. We use outside
        services to understand your messages and voice notes. We don&apos;t sell your data, and you can ask us to delete it.
      </p>

      <h2>Who we are</h2>
      <p>
        Misa is run by [Company legal name, RC number], [registered address], Nigeria (&quot;Kuditraka&quot;,
        &quot;we&quot;, &quot;us&quot;). We decide how your personal data is used, so we are the data controller under
        the Nigeria Data Protection Act 2023 (NDPA).
      </p>
      <p>This policy covers the Misa website (misa.kuditraka.name.ng), Misa on WhatsApp, and kuditraka.name.ng.</p>

      <h2>What we collect</h2>
      <LegalTable
        head={['What', 'Examples', 'Where it comes from']}
        rows={[
          ['Account details', "Your name, email, phone number, business name and type, password (stored scrambled, we can't read it)", 'You, when you sign up or edit your profile'],
          ['Business records', 'Sales, expenses, amounts, items, quantities, how you were paid, dates, your own extra columns', 'You, by message, voice note, photo, file or the website'],
          ['Stock', 'Item names, stock counts, prices, barcodes, evening counts', 'You or your staff'],
          ['Customers and debts', "Your customers' names and phone numbers, what they owe and what they paid back", 'You or your staff'],
          ['Staff', "Your staff's names, phone numbers, roles, and their PINs (stored scrambled)", 'You, when you add staff'],
          ['Bank details', 'The bank, account number and account name you want customers to pay into', 'You, on your profile'],
          ['Messages', 'Your chats with Misa, voice notes, photos of invoices or notebooks, uploaded files', 'You or your staff'],
          ['Activity', 'Who recorded or changed what, and when; sign-in times', 'Created as you use Misa'],
          ['Reminder settings and feedback', 'Your work hours, reminder choices, survey answers', 'You'],
        ]}
      />
      <p>We do not ask for your BVN, NIN, card numbers or bank passwords, and you should never send them to Misa.</p>

      <h2>Why we use it</h2>
      <LegalTable
        head={['Why', 'Legal basis (NDPA s.25)']}
        rows={[
          ['To keep your books: record sales, expenses, stock and debts; answer your questions; send your reports', 'Contract: it is the service you signed up for'],
          ['To send reminders, the evening cash check, the Monday weekly check-up and debt reminders', 'Contract, and your consent for optional messages (you can turn reminders off)'],
          ['To let your staff use your account with the rights you give them', 'Contract'],
          ['To keep Misa safe: stop misuse, fix errors, keep a record of changes', 'Legitimate interest'],
          ['To improve Misa, using records with names removed where we can', 'Legitimate interest'],
          ['To meet the law, for example a court order', 'Legal obligation'],
        ]}
      />
      <p>
        We do not use your records to show you adverts, and we do not sell your data. We only send you offers or news about
        new features if you say yes.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We share data only with services that help run Misa, and only what each one needs. They may use it only to provide
        their service to us.
      </p>
      <LegalTable
        head={['Service', 'What it does for Misa', 'What it receives', 'Where']}
        rows={[
          ['Anthropic (Claude AI)', "Understands your messages, photos and files, and writes Misa's replies", 'Your messages, the records needed to answer, photos and files you send', 'United States'],
          ['ElevenLabs', 'Turns voice notes into text', 'Your voice notes', 'United States [confirm]'],
          ['OpenAI (Whisper)', 'Backup for turning voice notes into text', 'Voice notes, only when ElevenLabs fails', 'United States'],
          ['Google (Gemini)', 'Draws the picture for the morning tip', 'The day’s tip only, no personal data', 'United States'],
          ['[WhatsApp gateway provider] and WhatsApp (Meta)', 'Carries messages between you and Misa', 'Your phone number and messages', '[confirm]'],
          ['[Server and database host]', 'Stores your account and records', 'Everything above', '[confirm country]'],
          ['Vercel', 'Hosts the Misa website', "Your browser's requests; your records pass through to show you your pages", 'United States and other regions'],
        ]}
      />
      <p>We may also share data:</p>
      <ul>
        <li>with your staff, as far as the rights you give them allow;</li>
        <li>if the law, a court or a regulator requires it;</li>
        <li>with a buyer if Kuditraka is sold or merged, under this same policy.</li>
      </ul>

      <h2>Data sent outside Nigeria</h2>
      <p>
        Some services above process data outside Nigeria, mainly in the United States. Misa can&apos;t read your messages,
        voice notes or photos without them.
      </p>
      <p>
        The NDPC has not declared that the United States gives adequate protection to personal data. This means Nigerian law
        may not fully protect your data there, and a foreign court or authority could ask a provider for it. To reduce this
        risk, we send each service only what it needs, and they may not use it for anything else.
      </p>
      <p>
        When you tick &quot;I agree&quot; at sign-up, you consent to this transfer (NDPA s.43). You can withdraw that consent
        by deleting your account; Misa can&apos;t work without these services.
      </p>

      <h2>How long we keep it</h2>
      <LegalTable
        head={['Data', 'How long']}
        rows={[
          ['Account, business records, stock, customers and debts', 'While your account is open, then [30 days] after you ask us to delete it'],
          ['Chat history with Misa', 'While your account is open; you can clear it yourself in the app'],
          ['Voice notes and photos', '[Deleted once read / kept for X days: confirm]'],
          ['Record of changes (who did what)', '[X years], for safety and disputes'],
          ['Backups', 'Up to [X days] after deletion, then overwritten'],
        ]}
      />
      <p>We may keep some records longer if the law requires it, for example for tax.</p>

      <h2>How we protect it</h2>
      <ul>
        <li>Passwords and staff PINs are stored scrambled (hashed); nobody at Kuditraka can read them.</li>
        <li>Data travels over encrypted connections (HTTPS).</li>
        <li>Staff see only what you allow; changes are logged with who made them.</li>
        <li>A staff PIN locks after too many wrong tries.</li>
      </ul>
      <p>No system is perfectly safe. If you think your account has been used by someone else, tell us at once.</p>

      <h2>Your customers&apos; details</h2>
      <p>
        When you save a customer&apos;s name, phone number or debt in Misa, you decide to keep that information, and Misa
        stores it for you. You should only save what you need, and only for customers who know you keep a record of what
        they owe. Misa sends nothing to your customers by itself: debt reminders go to you, and you choose whether to
        forward them.
      </p>

      <h2>Your rights</h2>
      <p>Under the NDPA (sections 34 to 38) you can ask us to:</p>
      <ul>
        <li>show you the data we hold about you, and give you a copy;</li>
        <li>correct data that is wrong;</li>
        <li>delete your data;</li>
        <li>stop or limit some uses of it, or object to them;</li>
        <li>give you your records in a common format to take elsewhere;</li>
        <li>withdraw consent you gave, for example for reminders (turn them off in the app or tell Misa &quot;stop reminders&quot;).</li>
      </ul>
      <p>
        To do any of these, email [privacy email] from the address on your account. We reply within 30 days. If you are not
        happy with our answer, you can complain to the Nigeria Data Protection Commission (NDPC) at ndpc.gov.ng.
      </p>

      <h2>Deleting your account</h2>
      <p>
        You can delete single records, customers, debts, stock items and staff yourself in the app, and clear your chat
        history. To delete your whole account and all its records, email [privacy email] from the address on your account.
        We confirm it is you, then delete within [30 days].
      </p>

      <h2>Children</h2>
      <p>Misa is for people running a business who are 18 or older. We don&apos;t knowingly collect data from children.</p>

      <h2>If something goes wrong</h2>
      <p>
        If a data breach is likely to put you at risk, we will tell the NDPC within 72 hours of finding out and tell you
        without delay, as the NDPA requires.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we change this policy in a way that matters, we will tell you on WhatsApp or in the app before it applies. The
        date at the top shows the latest version.
      </p>

      <h2>Contact</h2>
      <p>
        [Company legal name], [address]. Email: [privacy email]. WhatsApp: Misa, +234 816 112 2458. Data Protection Officer:
        [name or firm], [email]. NDPC registration number: [number].
      </p>
    </LegalPage>
  );
}
