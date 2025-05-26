// ==UserScript==
// @name         湖南开放大学 全自动刷课＋深度优化 v3.6.1
// @namespace    http://tampermonkey.net/
// @version      3.6.1
// @description  videoPlayback 刷完章节→严格刷新→待学→章节，解决无脑刷新问题，去除多余空格。
// @match        *://www.hnsydwpx.cn/videoPlayback/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function(){
  'use strict';
  const CH_FLAG = 'tm_v3_ch_done'; // 章节完成会话标志
  const PD_FLAG = 'tm_v3_last_pending'; // 上次点的待学课程名
  let busy = false;
  let lastPath = location.pathname;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // URL变化时重置章节完成标志
  setInterval(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      console.log('[URL] path changed → reset CH_FLAG');
      sessionStorage.removeItem(CH_FLAG);
      busy = false;
    }
  }, 1000);

  // 活动模拟防挂机
  (function act(){
    const x = Math.random() * innerWidth;
    const y = Math.random() * innerHeight;
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true }));
    ['Shift','Control','Alt'][Math.floor(Math.random() * 3)]
      .split('')
      .forEach(k => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
        document.dispatchEvent(new KeyboardEvent('keyup', { key: k, bubbles: true }));
      });
    setTimeout(act, 30000 + Math.random() * 30000);
  })();

  // 弹窗/连播处理
  setInterval(() => {
    const primary = document.querySelector('.el-message-box__btns .el-button--primary');
    const radios = document.querySelectorAll('label.el-radio');
    if (radios.length) {
      radios[0].click();
      primary && primary.click();
      return;
    }
    if (primary && /继续播放|是否继续播放下一节/.test(primary.innerText + document.body.innerText)) {
      primary.click();
      return;
    }
    if (primary) {
      primary.click();
    }
  }, 500);

  // 自动恢复播放
  setInterval(() => {
    const v = document.querySelector('video');
    if (v && v.paused) v.play().catch
