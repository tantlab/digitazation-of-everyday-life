import React, { FC } from "react";
import Header from "./Header";

const PARTNERS = [
  {
    label: "Aalborg University",
    img: "/img/logo-aau.png",
    url: "https://www.en.aau.dk/",
  },
  {
    label: "Center for Digital Welfare",
    img: "/img/logo-cdw.png",
    url: "https://en.itu.dk/research/center-for-digital-welfare",
  },
  {
    label: "IT University of Copenhagen",
    img: "/img/logo-itu.jpg",
    url: "https://en.itu.dk/",
  },
  {
    label: "The Techno-Anthropology Lab",
    img: "/img/logo-tantlab.png",
    url: "https://www.tantlab.aau.dk/",
  },
];

const About: FC = () => (
  <>
    <Header />
    <main className="container about-page">
      <h2>About this project</h2>
      <h1>The Digitization of Everyday Life During the Corona Crisis</h1>

      <h4>
        Download all tags here:{" "}
        <a href="">
          <i className="fas fa-download" /> tags.csv
        </a>
      </h4>

      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec
        consectetur odio. Phasellus tristique ante in dapibus sagittis. Ut
        ultricies tortor eget velit volutpat tincidunt. Nulla facilisi. Ut
        rutrum mauris ut elit finibus, et consequat lorem commodo. Suspendisse
        potenti. Morbi finibus euismod venenatis. Nam pretium dui ante, ac
        pretium odio luctus a. Donec congue eros non est ullamcorper, in
        bibendum ipsum viverra. Morbi sed tristique mi. Ut dictum gravida tortor
        at luctus. Cras dictum ullamcorper quam ac lacinia. Morbi fringilla leo
        lacus, nec lacinia massa facilisis a. Vestibulum mollis, mi quis egestas
        egestas, sem odio porta lacus, eget mollis sem turpis at erat.
        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
        cubilia curae; Nullam et aliquet orci, id scelerisque erat.
      </p>
      <p>
        Curabitur sollicitudin ligula sed eros dignissim tempor. In efficitur,
        metus quis posuere feugiat, enim lorem sagittis enim, vitae vulputate
        odio leo nec ante. Interdum et malesuada fames ac ante ipsum primis in
        faucibus. Donec magna libero, tincidunt eget leo in, tincidunt euismod
        neque. Vivamus sed augue mauris. Nulla volutpat sagittis purus, non
        venenatis est iaculis ut. Cras sem sem, fermentum ut consequat in,
        efficitur vel elit. Pellentesque habitant morbi tristique senectus et
        netus et malesuada fames ac turpis egestas. Maecenas nec accumsan
        sapien. Nullam scelerisque fringilla justo, vel laoreet turpis facilisis
        a. Aliquam erat volutpat. Class aptent taciti sociosqu ad litora
        torquent per conubia nostra, per inceptos himenaeos. Aliquam erat
        volutpat. Ut aliquam lobortis pretium.
      </p>
      <p>
        Suspendisse nec sapien mauris. Duis at sollicitudin ante. Proin risus
        nunc, tincidunt sit amet velit sit amet, sollicitudin fermentum augue.
        Praesent velit dui, rutrum vitae porta a, condimentum in lectus. Aenean
        efficitur risus vitae finibus blandit. Aliquam nec lectus in dolor porta
        blandit. In tempus placerat varius.
      </p>

      <div className="partners">
        {PARTNERS.map(({ url, label, img }, i) => (
          <div key={i}>
            <a className="unstyled" href={url} title={label}>
              <img src={img} alt={label} />
            </a>
          </div>
        ))}
      </div>
    </main>
  </>
);

export default About;
