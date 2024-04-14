import * as React from "react";

export default function Login() {
  return (
    <>
      <div className="box">
        <img
          loading="lazy"
          srcSet="..."
          className="img"
        />
        <div className="div">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/75c751b1549395e05708849622c666b1b79eaf1d6c0f9af86fdbdc9e0fe6435a?"
            className="img-2"
          />
          ID Number
        </div>
        <div className="div-3">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/75c751b1549395e05708849622c666b1b79eaf1d6c0f9af86fdbdc9e0fe6435a?"
            className="img-3"
          />
          Password
        </div>
        <div className="div-5">Login</div>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/2e6e2b3fd3f58702f29338d783354af156f172a8b08a945a5a263508520ca7ee?"
          className="img-4"
        />
      </div>
      <style jsx>{`
        .box {
          background-color: #f3bc00;
          display: flex;
          padding-top: 19px;
          flex-direction: column;
          align-items: center;
          font-size: 16px;
          color: #454b60;
          font-weight: 400;
        }
        .img {
          aspect-ratio: 0.88;
          object-fit: auto;
          object-position: center;
          width: 298px;
          max-width: 100%;
        }
        .div {
          disply: flex;
          flex-direction: column;
          font-family: Inter, sans-serif;
          position: relative;
          fill: #fff;
          stroke-width: 1px;
          stroke: #454b60;
          overflow: hidden;
          border-color: rgba(69, 75, 96, 1);
          border-style: solid;
          border-width: 1px;
          aspect-ratio: 8.38;
          width: 377px;
          max-width: 100%;
          align-items: start;
          justify-content: center;
          padding: 14px 30px;
        }
        @media (max-width: 991px) {
          .div {
            padding: 0 20px;
          }
        }
        .img-2 {
          position: absolute;
          inset: 0;
          height: 100%;
          width: 100%;
          object-fit: cover;
          object-position: center;
        }
        .div-2 {
          position: relative;
        }
        .div-3 {
          disply: flex;
          flex-direction: column;
          font-family: Inter, sans-serif;
          position: relative;
          fill: #fff;
          stroke-width: 1px;
          stroke: #454b60;
          overflow: hidden;
          border-color: rgba(69, 75, 96, 1);
          border-style: solid;
          border-width: 1px;
          aspect-ratio: 8.38;
          margin-top: 33px;
          width: 377px;
          max-width: 100%;
          align-items: start;
          white-space: nowrap;
          justify-content: center;
          padding: 14px 30px;
        }
        @media (max-width: 991px) {
          .div-3 {
            white-space: initial;
            padding: 0 20px;
          }
        }
        .img-3 {
          position: absolute;
          inset: 0;
          height: 100%;
          width: 100%;
          object-fit: cover;
          object-position: center;
        }
        .div-4 {
          position: relative;
        }
        .div-5 {
          font-family: Roboto Mono, sans-serif;
          justify-content: center;
          align-items: center;
          border-radius: 8px;
          background-color: #7f0404;
          margin-top: 58px;
          width: 326px;
          max-width: 100%;
          color: #f3bc00;
          font-weight: 700;
          white-space: nowrap;
          text-align: center;
          padding: 17px 60px;
        }
        @media (max-width: 991px) {
          .div-5 {
            margin-top: 40px;
            white-space: initial;
            padding: 0 20px;
          }
        }
        .img-4 {
          aspect-ratio: 4.09;
          object-fit: auto;
          object-position: center;
          width: 100%;
          fill: linear-gradient(
            90deg,
            #c46b02 7.7%,
            #7f0404 43.37%,
            #992500 70.48%
          );
          align-self: stretch;
          margin-top: 35px;
        }
        @media (max-width: 991px) {
          .img-4 {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}