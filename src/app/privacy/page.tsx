import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

// Was falling back to the root layout's generic metadata (see app/layout.tsx) — see
// /founding-funders' own metadata export for why every publicly indexable route
// (sitemap.ts/robots.ts list all five) gets one instead.
export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Limbic's Privacy Policy: how we collect, use, and protect your information on the Limbic platform.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updated="September 1, 2026">
      <h2 className="legal-section-title">1. Information We Collect</h2>
      <p className="legal-body">When you create an account and use Limbic we collect:</p>
      <ul className="legal-list">
        <li>Account information: name, email address, license number for PT accounts, specialty, and practice state.</li>
        <li>Payment information: payment processing is handled by Stripe. Limbic does not store credit card numbers or payment details directly.</li>
        <li>
          Wellness data you track about yourself: height, weight, age, activity level, sleep, mood, vitals, and
          other self-reported metrics you enter into Limbic Metrics, or that you choose to sync from a connected
          fitness or health account (see Section 5). This data is used to personalize your own wellness experience
          and is not used to provide medical care.
        </li>
        <li>
          Clinical practice data: if you are a clinician, information you enter about your own clinical practice
          and, where the feature involves recording information about a specific patient or client, that
          information — see Section 2 below for what this can include and who is responsible for it.
        </li>
        <li>
          Education data: if you are a PT student, syllabus text you upload or paste and the assignments extracted
          from it, and any course material you choose to put through Study Guide Creator &mdash; including lecture
          slide PDFs. Text from that material is sent to Anthropic to generate flashcards and study notes, and the
          extracted text, flashcards and notes are stored under your account. Only upload material you created or
          are permitted to use; see your school&rsquo;s policy on course materials.
        </li>
        <li>
          Usage data: articles read, searches performed, content saved, streak activity, game completions, and
          feature interactions. This data is used to personalize your experience.
        </li>
        <li>Profile information: headline, bio, and any information you choose to add to your Nexus profile.</li>
      </ul>

      <h2 className="legal-section-title">2. Patient and Client Data You Enter</h2>
      <p className="legal-body">
        Several LimbicPRO tools — including the Clinician Dashboard, Force Lab, Outcome Measures, and the Connexion
        Safety Score assessment — let a clinician record information about a specific patient or client in order to
        use the tool. Depending on which fields you choose to fill in, this can include a name, contact details or
        address, clinical notes, assessment scores, and other information about that individual&rsquo;s condition or
        care. This information is stored under your account and is visible only to you (and, for Clinic PRO
        multi-clinician accounts, other clinicians on your team).
      </p>
      <p className="legal-body">
        <strong>Limbic is not a covered entity or business associate under HIPAA</strong>, does not offer a signed
        Business Associate Agreement, and these tools are not a certified medical record system. If you are a
        licensed clinician, you are solely responsible for complying with HIPAA, your state&rsquo;s health
        information laws, your employer&rsquo;s policies, and any other legal or professional obligation that
        applies to how you record and store information about your patients or clients — including obtaining any
        consent required to do so. Where a field lets you use a reference code, initials, or other de-identified
        label instead of a full name, we recommend doing so; several of these tools (for example, Home Exercise
        Programs) are built around reference codes for this reason, but not all of them require it, and Limbic
        cannot control what you choose to type into a free-text field.
      </p>

      <h2 className="legal-section-title">3. The Connexion Method and Consumer Health Data</h2>
      <p className="legal-body">
        The Connexion Method is a Limbic partner program offering in-home safety and mobility assessments. Unlike
        the clinician tools described in Section 2, <strong>Limbic itself is the collector here</strong>, and this
        section describes what we hold and why.
      </p>
      <p className="legal-body">
        If you request a visit through the form on the Connexion pages, we collect your name, phone number, email
        address, your preferred date and time, and the reason for your visit. We use these only to contact you
        about scheduling and to carry out the assessment you asked for. The form asks you to affirmatively agree
        to this before you submit it, and we record both the date of your agreement and the exact wording you
        agreed to.
      </p>
      <p className="legal-body">
        If a visit goes ahead, the Connexion Safety Score assessment records the client&rsquo;s name, the address
        visited, scores across roughly fifty home-environment, mobility, and fall-risk items, a resulting risk
        level, any critical safety findings, and recommended equipment. This is held under Limbic&rsquo;s own
        administrative access and is visible only to Limbic staff and the licensed physical therapist conducting
        the Connexion Method visit.
      </p>
      <p className="legal-body">
        We treat this information, along with the wellness data described in Section 1, as{" "}
        <strong>consumer health data</strong>. We do not sell it, we do not use it for advertising, and we do not
        share it with third parties for their own purposes. You may ask us to provide a copy of it, correct it, or
        delete it at any time using the contact details in Section 14, and we will not condition the service on
        your agreeing to anything beyond what the assessment itself requires. Residents of Washington, Nevada, and
        other states with consumer health data laws have these rights by statute; we extend them to everyone.
      </p>
      <p className="legal-body">
        Limbic is not a covered entity or business associate under HIPAA, and a Connexion assessment is not a
        medical record. It is a home safety assessment.
      </p>

      <h2 className="legal-section-title">4. How We Use Your Information</h2>
      <p className="legal-body">We use the information we collect to:</p>
      <ul className="legal-list">
        <li>Provide the specific tool you are using — for example, generating a Force Lab comparison or a patient brief you requested.</li>
        <li>Personalize your content feed based on reading history and followed topics.</li>
        <li>Power Limbic Agent recommendations and gap topic suggestions.</li>
        <li>Track streaks and daily activity for the dashboard and games.</li>
        <li>Send you notifications you have opted into.</li>
        <li>Improve the platform based on usage patterns.</li>
      </ul>
      <p className="legal-body">We do not sell your personal information to third parties.</p>

      <h2 className="legal-section-title">5. Third Party Services</h2>
      <p className="legal-body">
        Limbic uses the following third party services to provide the platform. Some are used for every account;
        others only process your data if you choose to use the related feature.
      </p>
      <ul className="legal-list">
        <li>
          Anthropic: powers Limbic Agent and AI-assisted search. Queries you send to these features are processed
          by Anthropic&rsquo;s API. See Anthropic&rsquo;s privacy policy at anthropic.com.
        </li>
        <li>Stripe: processes subscription and Founding Funder payments. See Stripe&rsquo;s privacy policy at stripe.com.</li>
        <li>Vercel: hosts the Limbic platform and provides aggregate, cookieless usage analytics (Vercel Analytics and Speed Insights). See Vercel&rsquo;s privacy policy at vercel.com.</li>
        <li>Turso: hosts Limbic&rsquo;s production database.</li>
        <li>Resend: delivers account emails such as password resets.</li>
        <li>Google: if you sign in with Google or connect a Google Health account, Google processes the associated authentication or health data. See Google&rsquo;s privacy policy at policies.google.com/privacy.</li>
        <li>Strava and Fitbit: if you connect one of these accounts from your Activity Log, Limbic receives your recent activity data from that provider to sync into your Limbic Metrics log.</li>
        <li>PubMed and Unpaywall: research articles and full-text links are sourced from these public research APIs. No account data is sent to them.</li>
        <li>YouTube and Pexels: power the Clips and article-image features respectively. No account data is sent to them.</li>
      </ul>

      <h2 className="legal-section-title">6. Data Retention</h2>
      <p className="legal-body">
        We retain your account data for as long as your account is active. Deleting your account from Profile
        Settings permanently and immediately removes your account and the data associated with it. Some anonymized
        usage data, and records we are required to keep for legal, tax, or dispute-resolution purposes (such as
        payment records), may be retained after account deletion.
      </p>

      <h2 className="legal-section-title">7. Your Rights</h2>
      <p className="legal-body">You have the right to:</p>
      <ul className="legal-list">
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate data.</li>
        <li>Delete your account and associated data at any time from Profile Settings.</li>
        <li>Request a copy of your data by contacting us at the address below.</li>
      </ul>
      <p className="legal-body">To exercise these rights contact us at limbic.center.</p>

      <h2 className="legal-section-title">8. California Privacy Rights</h2>
      <p className="legal-body">
        If you are a California resident you have additional rights under the California Consumer Privacy Act
        including the right to know what personal information is collected, the right to delete personal
        information, and the right to opt out of the sale of personal information. Limbic does not sell personal
        information.
      </p>

      <h2 className="legal-section-title">9. Cookies and Analytics</h2>
      <p className="legal-body">
        Limbic uses a session cookie to keep you signed in. We do not use third party advertising cookies. We use
        Vercel Analytics and Speed Insights, which are cookieless and report only aggregated, non-identifying usage
        statistics.
      </p>

      <h2 className="legal-section-title">10. International Users</h2>
      <p className="legal-body">
        Limbic is operated from the United States, and our servers and service providers are located in the United
        States. If you access Limbic from outside the United States, your information will be transferred to and
        processed in the United States, which may not offer the same level of data protection as your own country.
      </p>
      <p className="legal-body">
        Limbic is built for a United States audience and is not marketed or targeted to the European Economic
        Area, the United Kingdom, or Switzerland. If you are in one of those regions and choose to use Limbic
        anyway, we handle your personal data as follows. We process it to perform the agreement between us (in
        order to provide the account and features you asked for), on the basis of your consent where you have
        given it (connecting a fitness account, requesting a Connexion visit), and on the basis of our legitimate
        interest in operating and improving the platform. You may request access to your data, correction,
        deletion, a portable copy, or restriction of processing, and you may withdraw consent at any time — use
        the contact details in Section 14, and we will respond within one month. You also have the right to
        complain to your local supervisory authority.
      </p>
      <p className="legal-body">
        We have not appointed an EU or UK representative and do not currently rely on Standard Contractual
        Clauses, because Limbic does not target those markets. If that changes, this policy will change with it.
      </p>

      <h2 className="legal-section-title">11. Children</h2>
      <p className="legal-body">
        Limbic is not intended for users under the age of 13. We do not knowingly collect personal information
        from children under 13.
      </p>

      <h2 className="legal-section-title">12. Security</h2>
      <p className="legal-body">
        We take reasonable measures to protect your personal information including encrypted connections and
        secure data storage. No method of transmission over the internet is completely secure and we cannot
        guarantee absolute security.
      </p>

      <h2 className="legal-section-title">13. Changes to This Policy</h2>
      <p className="legal-body">
        We may update this privacy policy from time to time. We will notify users of significant changes via the
        platform. Continued use of Limbic after changes constitutes acceptance of the updated policy.
      </p>

      <h2 className="legal-section-title">14. Contact</h2>
      <p className="legal-body">For privacy questions or data requests contact: limbic.center</p>
      <p className="legal-body">Newport Beach, California</p>
    </LegalPageLayout>
  );
}
