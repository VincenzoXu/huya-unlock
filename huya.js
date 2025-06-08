// ==UserScript==
// @name         解锁虎牙扫码限制
// @namespace    http://tampermonkey.net/
// @version      2025-06-08
// @description  解锁虎牙最新限制：当观看最高画质时需要手机虎牙扫码
// @author       Kyose
// @match        https://www.huya.com/*
// @grant        none
// @icon         https://www.huya.com/favicon.ico
// ==/UserScript==

(function () {
  'use strict'

  // 记录上次 alert 时间
  let lastAlertTime = 0
  // 设置 1 秒冷却时间
  const alertCooldown = 1000

  // 之前的线路
  let preVideoLine = ''

  // 解锁函数
  const unlockFn = () => {
    let unlockIntervalId = setInterval(() => {
      const targetElement = document.querySelectorAll('.player-videotype-list li')

      let alertFlag = false
      if (targetElement) {
        // 修改属性值
        targetElement.forEach((element) => {
          const data = $(element).data("data")
          if (data.iEnable !== 1) {
            data.iEnable = 1
            data.iEnableMethod = 0
            data.sTagText = ""
            data.status = 0
            alertFlag = true
          }
        })
        if (alertFlag) {
          const now = Date.now()
          if (now - lastAlertTime > alertCooldown) {
            alert("成功解锁扫码限制！")
            lastAlertTime = now // 更新上次 alert 时间
          }

          // 去除“扫码即享”
          const shit = document.getElementsByClassName("bitrate-right-btn common-enjoy-btn")
          if (shit.length > 0) {
            for (let index = shit.length - 1; index >= 0; index--) {
              shit[index].remove()
            }
            document.getElementsByClassName("player-menu-panel player-menu-panel-common")[0].style.setProperty('width', '140px', 'important')
          }

        }
        setTimeout(() => {
          targetElement[0].click()
          if ($(".player-narrowpage").size() === 0 && $(".player-narrowscreen").size() === 0) {
            $("#player-fullpage-btn:first").click()
          }
        }, 1000)
        clearInterval(unlockIntervalId)
      }
    }, 500) // 每 500ms 检查一次
  }
  unlockFn()

  // 监听当前线路变化函数
  const observeCurVideoLineFn = () => {
    let observerIntervalId = setInterval(() => {
      const curVideoLineSpan = document.querySelectorAll('.player-videoline-cur span')
      if (curVideoLineSpan.length > 0) {
        preVideoLine = curVideoLineSpan[0].textContent
        const observeCurVideoLine = (target) => {
          const observer = new MutationObserver((mutationRecords) => {
            mutationRecords.forEach((mutationRecord) => {
              if (mutationRecord.type === "childList") {
                const curVideoLine = mutationRecord.target.textContent
                if (curVideoLine !== preVideoLine) {
                  unlockFn()
                  preVideoLine = curVideoLine
                }
              }
            })
          })
          observer.observe(target, { childList: true, })
        }
        if (preVideoLine) {
          observeCurVideoLine(curVideoLineSpan[0])
          clearInterval(observerIntervalId)
        }
      }
    }, 500)
  }
  observeCurVideoLineFn()
})()