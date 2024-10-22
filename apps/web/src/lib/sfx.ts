import uifx from "uifx";
import select from "@/assets/select.wav";
import click from "@/assets/click.wav";
import success from "@/assets/success.wav";
import c1 from "@/assets/complete/c1.wav";
import c2 from "@/assets/complete/c2.wav";
import c3 from "@/assets/complete/c3.wav";
import c4 from "@/assets/complete/c4.wav";
import c5 from "@/assets/complete/c5.wav";
import c6 from "@/assets/complete/c6.wav";
import c7 from "@/assets/complete/c7.wav";
import d1 from "@/assets/delete/d1.wav";
import d2 from "@/assets/delete/d2.wav";
import d3 from "@/assets/delete/d3.wav";
import d4 from "@/assets/delete/d4.wav";
import d5 from "@/assets/delete/d5.wav";

const getRandomElement = <T>(arr: T[]) => {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
};

const completeSFX = [c1, c2, c3, c4, c5, c6, c7];
const deleteSFX = [d1, d2, d3, d4, d5];

const selectAudio = new uifx(select, { volume: 0.2 });
const successAudio = new uifx(success, { volume: 0.4 });
const clickAudio = new uifx(click, { volume: 0.2 });

const completeAudio = () => {
  return new uifx(getRandomElement(completeSFX), { volume: 0.8 });
};

const deleteAudio = () => {
  return new uifx(getRandomElement(deleteSFX), { volume: 0.6 });
};

export const sfx = {
  select: selectAudio,
  click: clickAudio,
  success: successAudio,
  complete: completeAudio,
  delete: deleteAudio,
};
