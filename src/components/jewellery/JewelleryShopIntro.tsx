import styles from "./jewellery-shop.module.scss";

const JewelleryShopIntro = () => {
    return (
        <section className={styles.intro}>
            <h2 className={styles.introTitle}>Earrings – Handcrafted Elegance in Recycled Gold &amp; Silver</h2>
            <p>
                Every piece in our earring collection is designed in-house and handcrafted in small batches using
                recycled gold and sterling silver. From sculptural hoops to delicate studs and natural pearl drops,
                each design is made to be worn every day and treasured for years.
            </p>
            <p>
                Our gold vermeil is a thick layer of 18k gold over sterling silver, giving you the warmth of solid
                gold with a lighter footprint. All earrings are nickel-free, hypoallergenic and arrive in
                recyclable packaging, ready to gift.
            </p>
        </section>
    );
};

export default JewelleryShopIntro;
