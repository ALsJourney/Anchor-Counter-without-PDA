import { type NextPage } from "next";
import Content from "~/components/Content";
import Context from "~/components/Context";
import Footer from "~/components/Footer";

require("@solana/wallet-adapter-react-ui/styles.css");
const Home: NextPage = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <Context>
        <Content />
      </Context>
      <Footer />
    </div>
  );
};

export default Home;
