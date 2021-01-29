import React, { FC } from "react";
import Header from "./Header";
import config from "../config";

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
        Download all user tags here:{" "}
        <a
          href={`${config.api_url}/user_tags.csv`}
          title="Download the CSV file of user tags"
          target="_blank"
        >
          <i className="fas fa-download" /> tags.csv
        </a>
      </h4>

      <p>
        This datascape allows you to enter and navigate an online ethnographic
        archive. The archive contains material collected during the COVID-19
        lockdown that took place between April and June, 2020 in Denmark. This
        includes 222 interviews, 84 online diaries, and 89 field observations.
        The material was collected as part of the project{" "}
        <a href="https://deltagelsensgrammatik.itu.dk/om-projektet/">
          "The Grammar of Participation: The Digitalization of Everyday Life
          During the Corona Crisis"
        </a>
        . The project was carried out in collaboration between researchers at
        the <a href="https://cdw.itu.dk">Centre for Digital Welfare</a> at the{" "}
        <a href="https://www.itu.dk">IT University of Copenhagen</a> and the{" "}
        <a href="https://www.tantlab.aau.dk">Techno-Anthropology Lab</a> at{" "}
        <a href="https://www.aau.dk">University of Aalborg</a>.
      </p>

      <p>
        You can search the material of the archive across interviews,
        observations and diaries, as well as explore similarities and
        differences by browsing. To make the archive navigable, the materials
        have been divided into text segments, pre-tagged and analyzed for
        semantic similarities between segments. In this process we have used
        natural language processing to detect mentions of technologies,
        toponymies, places and other named entities as well as a Doc2Vec model
        to measure similarity. These pre-tagged named entities are called
        "machine generaged tags" and should be distinguished from the "user
        generaged tags" that you can add to the archive as part of your search
        and exploration.
      </p>

      <p>
        Access to the datascape presumes that your research project has been
        approved by the archive’s stewards: Brit Ross Winthereik (
        <a href="mailto:brwi@itu.dk">brwi@itu.dk</a>) and Anders Kristian Munk (
        <a href="mailto:anderskm@hum.aau.dk">anderskm@hum.aau.dk</a>).
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
