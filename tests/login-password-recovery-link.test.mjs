import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("login modal exposes password recovery link to the dedicated recovery page", () => {
  const modalStart = html.indexOf('id="loginModal"');
  const modalEnd = html.indexOf('<!-- Модалка Продолжить / Новый -->', modalStart);
  assert.notEqual(modalStart, -1);
  assert.notEqual(modalEnd, -1);
  const modal = html.slice(modalStart, modalEnd);
  assert.match(modal, /Забыли пароль\? Восстановить по email/);
  assert.match(modal, /https:\/\/prilogenia-password-recovery\.onrender\.com\//);
  assert.match(modal, /target="_blank" rel="noopener noreferrer"/);
});

test("password recovery link is visible alongside login controls", () => {
  const modalStart = html.indexOf('id="loginModal"');
  const modalEnd = html.indexOf('<!-- Модалка Продолжить / Новый -->', modalStart);
  const modal = html.slice(modalStart, modalEnd);
  assert.ok(modal.indexOf('id="loginBtn"') < modal.indexOf("Забыли пароль"));
  assert.ok(modal.indexOf('id="passwordInput"') < modal.indexOf("Забыли пароль"));
});
