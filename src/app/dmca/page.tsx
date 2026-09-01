import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

// Same reasoning as /terms and /privacy: every publicly indexable route (sitemap.ts and
// robots.ts list them all) gets its own metadata rather than falling back to the root
// layout's generic copy.
export const metadata: Metadata = {
  title: "Copyright & DMCA Policy",
  description:
    "How to report copyright infringement on Limbic, and Limbic's notice-and-takedown and repeat-infringer policy.",
};

export default function DmcaPage() {
  return (
    <LegalPageLayout title="Copyright & DMCA Policy" updated="September 1, 2026">
      <h2 className="legal-section-title">1. Our Position on Copyright</h2>
      <p className="legal-body">
        Limbic respects the intellectual property rights of others and expects its users to do the same. Limbic
        hosts content submitted by its users — including Nexus posts, images, comments, and clips — and responds
        to clear notices of alleged copyright infringement in accordance with the Digital Millennium Copyright
        Act (17 U.S.C. &sect; 512).
      </p>
      <p className="legal-body">
        This policy is separate from, and additional to, the platform liability provisions in Section 8 of our{" "}
        <a href="/terms">Terms of Service</a>. Section 230 of the Communications Decency Act does not apply to
        intellectual property claims; this policy is how copyright claims are handled.
      </p>

      <h2 className="legal-section-title">2. Reporting Alleged Infringement</h2>
      <p className="legal-body">
        If you believe content on Limbic infringes a copyright you own or are authorized to act on behalf of,
        send a written notice to our designated agent at the address in Section 5. To be effective under the
        DMCA, your notice must include substantially all of the following:
      </p>
      <ul className="legal-list">
        <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.</li>
        <li>Identification of the copyrighted work claimed to have been infringed.</li>
        <li>
          Identification of the material claimed to be infringing, with enough detail for us to locate it — a
          direct URL to the post or page is the most reliable form.
        </li>
        <li>Your name, mailing address, telephone number, and email address.</li>
        <li>
          A statement that you have a good faith belief that the use is not authorized by the copyright owner,
          its agent, or the law.
        </li>
        <li>
          A statement, made under penalty of perjury, that the information in the notice is accurate and that you
          are the copyright owner or are authorized to act on their behalf.
        </li>
      </ul>
      <p className="legal-body">
        Please note that under 17 U.S.C. &sect; 512(f), a person who knowingly materially misrepresents that
        material is infringing may be liable for damages, including costs and attorneys&rsquo; fees.
      </p>

      <h2 className="legal-section-title">3. What Happens After a Notice</h2>
      <p className="legal-body">
        On receiving an effective notice, Limbic will expeditiously remove or disable access to the material
        identified and will make a reasonable attempt to notify the user who posted it, including a copy of the
        notice. Limbic may remove material at its discretion under the Terms of Service regardless of whether a
        formal notice is received.
      </p>

      <h2 className="legal-section-title">4. Counter-Notification</h2>
      <p className="legal-body">
        If your content was removed and you believe the removal was the result of a mistake or a
        misidentification, you may send a counter-notification to the agent below containing: your physical or
        electronic signature; identification of the removed material and the location it appeared before removal;
        a statement under penalty of perjury that you have a good faith belief the material was removed as a
        result of mistake or misidentification; your name, address, and telephone number; and a statement that
        you consent to the jurisdiction of the federal district court for the judicial district in which your
        address is located (or, if outside the United States, any judicial district in which Limbic may be
        found), and that you will accept service of process from the party who filed the original notice.
      </p>
      <p className="legal-body">
        If we receive a valid counter-notification we may restore the material in 10 to 14 business days unless
        the original complainant notifies us that they have filed an action seeking to restrain the allegedly
        infringing activity.
      </p>

      <h2 className="legal-section-title">5. Designated Copyright Agent</h2>
      <p className="legal-body">
        Notices of alleged infringement and counter-notifications should be sent to Limbic&rsquo;s designated
        agent:
      </p>
      <p className="legal-body">
        Copyright Agent, Limbic
        <br />
        Newport Beach, California
        <br />
        limbic.center
      </p>

      <h2 className="legal-section-title">6. Repeat Infringers</h2>
      <p className="legal-body">
        Limbic will, in appropriate circumstances, disable and terminate the accounts of users who are repeat
        infringers. An account that is the subject of repeated effective infringement notices may be suspended or
        terminated, and a Founding Funder lifetime membership is subject to termination on the same terms as any
        other account (see Section 11 of the Terms of Service). Limbic maintains a record of notices received for
        this purpose.
      </p>

      <h2 className="legal-section-title">7. Third Party and Curated Content</h2>
      <p className="legal-body">
        Some content on Limbic is not user-submitted: research metadata and abstracts sourced from public
        research APIs, clinical practice guidelines linked to their publishers, news headlines linking out to
        their original outlets, and embedded third party video. If you are a rights holder and believe any of
        this material is used improperly, contact the agent above — you do not need to file a formal DMCA notice
        to raise it with us, and we would rather hear about it directly.
      </p>
    </LegalPageLayout>
  );
}
