import { permanentRedirect } from "next/navigation";

const page = () => {
    permanentRedirect("/");
};

export default page;
