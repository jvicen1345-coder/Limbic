import { LegalPageLayout } from "@/components/LegalPageLayout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updated="August 14, 2026">
      <h2 className="legal-section-title">1. Information We Collect</h2>
      <p className="legal-body">When you create an account on Limbic we collect:</p>
      <ul className="legal-list">
        <li>Account information: name, email address, license number for PT accounts, specialty, and practice state.</li>
        <li>
          Usage data: articles read, searches performed, content saved, streak activity, game completions, and
          feature interactions. This data is used to personalize your experience.
        </li>
        <li>Profile information: headline, bio, and any information you choose to add to your Nexus profile.</li>
        <li>
          Payment information: payment processing is handled by Stripe. Limbic does not store credit card numbers
          or payment details directly.
        </li>
        <li>
          Wellness data: height, weight, age, activity level, and exercise logs entered into Limbic Vitals are
          used solely to personalize your wellness experience. This information is not shared with third parties
          and is not used for medical purposes.
        </li>
      </ul>

      <h2 className="legal-section-title">2. What We Never Collect</h2>
      <p className="legal-body">
        Limbic is designed to never collect patient data or Protected Health Information as defined by HIPAA. Home
        Exercise Programs created on Limbic use reference codes only; no patient names, dates of birth, or
        identifying information are stored on the platform.
      </p>

      <h2 className="legal-section-title">3. How We Use Your Information</h2>
      <p className="legal-body">We use the information we collect to:</p>
      <ul className="legal-list">
        <li>Personalize your content feed based on reading history and followed topics.</li>
        <li>Power Limbic Agent recommendations and gap topic suggestions.</li>
        <li>Track streaks and daily activity for the dashboard and games.</li>
        <li>Send you notifications you have opted into.</li>
        <li>Improve the platform based on usage patterns.</li>
      </ul>
      <p className="legal-body">We do not sell your personal information to third parties.</p>

      <h2 className="legal-section-title">4. Third Party Services</h2>
      <p className="legal-body">Limbic uses the following third party services:</p>
      <ul className="legal-list">
        <li>
          Anthropic: powers Limbic Agent. Queries sent to Limbic Agent are processed by Anthropic&rsquo;s API. See
          Anthropic&rsquo;s privacy policy at anthropic.com.
        </li>
        <li>Stripe: processes subscription payments. See Stripe&rsquo;s privacy policy at stripe.com.</li>
        <li>Vercel: hosts the Limbic platform. See Vercel&rsquo;s privacy policy at vercel.com.</li>
        <li>PubMed: research articles are sourced from PubMed&rsquo;s public API. No user data is sent to PubMed.</li>
      </ul>

      <h2 className="legal-section-title">5. Data Retention</h2>
      <p className="legal-body">
        We retain your account data for as long as your account is active. If you delete your account your
        personal data is removed within 30 days. Some anonymized usage data may be retained for platform
        improvement purposes.
      </p>

      <h2 className="legal-section-title">6. Your Rights</h2>
      <p className="legal-body">You have the right to:</p>
      <ul className="legal-list">
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate data.</li>
        <li>Request deletion of your account and associated data.</li>
        <li>Export your data in a readable format.</li>
      </ul>
      <p className="legal-body">To exercise these rights contact us at limbic.center.</p>

      <h2 className="legal-section-title">7. California Privacy Rights</h2>
      <p className="legal-body">
        If you are a California resident you have additional rights under the California Consumer Privacy Act
        including the right to know what personal information is collected, the right to delete personal
        information, and the right to opt out of the sale of personal information. Limbic does not sell personal
        information.
      </p>

      <h2 className="legal-section-title">8. Cookies</h2>
      <p className="legal-body">
        Limbic uses session cookies to keep you signed in. We do not use tracking cookies or third party
        advertising cookies.
      </p>

      <h2 className="legal-section-title">9. Children</h2>
      <p className="legal-body">
        Limbic is not intended for users under the age of 13. We do not knowingly collect personal information
        from children under 13.
      </p>

      <h2 className="legal-section-title">10. Security</h2>
      <p className="legal-body">
        We take reasonable measures to protect your personal information including encrypted connections and
        secure data storage. No method of transmission over the internet is completely secure and we cannot
        guarantee absolute security.
      </p>

      <h2 className="legal-section-title">11. Changes to This Policy</h2>
      <p className="legal-body">
        We may update this privacy policy from time to time. We will notify users of significant changes via the
        platform. Continued use of Limbic after changes constitutes acceptance of the updated policy.
      </p>

      <h2 className="legal-section-title">12. Contact</h2>
      <p className="legal-body">For privacy questions or data requests contact: limbic.center</p>
      <p className="legal-body">Newport Beach, California</p>
    </LegalPageLayout>
  );
}
