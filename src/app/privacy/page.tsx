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
    <LegalPageLayout title="Privacy Policy" updated="August 31, 2026">
      <h2 className="legal-section-title">1. Information We Collect</h2>
      <p className="legal-body">When you create an account and use Limbic we collect:</p>
      <ul className="legal-list">
        <li>Account information: name, email address, license number for PT accounts, specialty, and practice state.</li>
        <li>Payment information: payment processing is handled by Stripe. Limbic does not store credit card numbers or payment details directly.</li>
        <li>
          Wellness data you track about yourself: height, weight, age, activity level, sleep, mood, vitals, and
          other self-reported metrics you enter into Limbic Vitals, or that you choose to sync from a connected
          fitness or health account (see Section 4). This data is used to personalize your own wellness experience
          and is not used to provide medical care.
        </li>
        <li>
          Clinical practice data: if you are a clinician, information you enter about your own clinical practice
          and, where the feature involves recording information about a specific patient or client, that
          information — see Section 2 below for what this can include and who is responsible for it.
        </li>
        <li>
          Education data: if you are a PT student, syllabus text you upload or paste and the assignments extracted
          from it.
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

      <h2 className="legal-section-title">3. How We Use Your Information</h2>
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

      <h2 className="legal-section-title">4. Third Party Services</h2>
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
        <li>Strava and Fitbit: if you connect one of these accounts from your Activity Log, Limbic receives your recent activity data from that provider to sync into your Limbic Vitals log.</li>
        <li>PubMed and Unpaywall: research articles and full-text links are sourced from these public research APIs. No account data is sent to them.</li>
        <li>YouTube and Pexels: power the Clips and article-image features respectively. No account data is sent to them.</li>
      </ul>

      <h2 className="legal-section-title">5. Data Retention</h2>
      <p className="legal-body">
        We retain your account data for as long as your account is active. Deleting your account from Profile
        Settings permanently and immediately removes your account and the data associated with it. Some anonymized
        usage data, and records we are required to keep for legal, tax, or dispute-resolution purposes (such as
        payment records), may be retained after account deletion.
      </p>

      <h2 className="legal-section-title">6. Your Rights</h2>
      <p className="legal-body">You have the right to:</p>
      <ul className="legal-list">
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate data.</li>
        <li>Delete your account and associated data at any time from Profile Settings.</li>
        <li>Request a copy of your data by contacting us at the address below.</li>
      </ul>
      <p className="legal-body">To exercise these rights contact us at limbic.center.</p>

      <h2 className="legal-section-title">7. California Privacy Rights</h2>
      <p className="legal-body">
        If you are a California resident you have additional rights under the California Consumer Privacy Act
        including the right to know what personal information is collected, the right to delete personal
        information, and the right to opt out of the sale of personal information. Limbic does not sell personal
        information.
      </p>

      <h2 className="legal-section-title">8. Cookies and Analytics</h2>
      <p className="legal-body">
        Limbic uses a session cookie to keep you signed in. We do not use third party advertising cookies. We use
        Vercel Analytics and Speed Insights, which are cookieless and report only aggregated, non-identifying usage
        statistics.
      </p>

      <h2 className="legal-section-title">9. International Users</h2>
      <p className="legal-body">
        Limbic is operated from the United States and our servers and service providers are located in the United
        States. If you access Limbic from outside the United States, your information will be transferred to and
        processed in the United States.
      </p>

      <h2 className="legal-section-title">10. Children</h2>
      <p className="legal-body">
        Limbic is not intended for users under the age of 13. We do not knowingly collect personal information
        from children under 13.
      </p>

      <h2 className="legal-section-title">11. Security</h2>
      <p className="legal-body">
        We take reasonable measures to protect your personal information including encrypted connections and
        secure data storage. No method of transmission over the internet is completely secure and we cannot
        guarantee absolute security.
      </p>

      <h2 className="legal-section-title">12. Changes to This Policy</h2>
      <p className="legal-body">
        We may update this privacy policy from time to time. We will notify users of significant changes via the
        platform. Continued use of Limbic after changes constitutes acceptance of the updated policy.
      </p>

      <h2 className="legal-section-title">13. Contact</h2>
      <p className="legal-body">For privacy questions or data requests contact: limbic.center</p>
      <p className="legal-body">Newport Beach, California</p>
    </LegalPageLayout>
  );
}
