import JewelleryCustomiser from "@/components/jewellery/custom/JewelleryCustomiser";
import styles from "@/components/jewellery/custom/jewellery-custom.module.scss";
import { BRAND_NAME } from "@/constant/brand";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: `Design Your Own - Bespoke Jewellery | ${BRAND_NAME}`,
    description: "Design a bespoke ring, pendant or earrings in 3D – choose the metal, gemstone, cut and setting, then send your design to our goldsmiths.",
};

const steps = [
    { title: "Design", text: "Shape your piece in 3D – metal, stone, cut, setting and band – and see it come to life." },
    { title: "Consult", text: "A goldsmith reviews your design, sources stones and confirms pricing with you." },
    { title: "Handcraft", text: "Your piece is made by hand in our studio and delivered in 4–6 weeks." },
];

const page = () => {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <p className={styles.eyebrow}>Bespoke studio</p>
                <h1 className={styles.heroTitle}>
                    Design your <em>own</em>
                </h1>
                <p className={styles.heroText}>
                    Create a one-of-a-kind piece in real time. Rotate it, refine every detail, then send it to us – we&apos;ll
                    handcraft it just for you.
                </p>
            </section>

            <Suspense fallback={<div className={styles.viewerLoading}>Preparing your studio…</div>}>
                <JewelleryCustomiser>
                    <section className={styles.process}>
                        {steps.map((step, index) => (
                            <div key={step.title} className={styles.processItem}>
                                <span className={styles.stepIndex}>{String(index + 1).padStart(2, "0")}</span>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </div>
                        ))}
                    </section>
                </JewelleryCustomiser>
            </Suspense>
        </main>
    );
};

export default page;
