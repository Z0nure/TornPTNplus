// ==UserScript==
// @name         Pickpocket Target Notifier++
// @namespace    torn.target.notifier
// @version      1.0.0
// @description  Notify when selected targets are available.
// @author       Zonure
// @match        https://www.torn.com/loader.php?sid=crimes
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  const TARGET_OPTIONS = [
    'Cyclist', 'Postal Worker', 'Mobster', 'Police Officer', 'Rich Kid',
    'Drunk Man', 'Drunk Woman', 'Homeless Person', 'Junkie', 'Elderly Man',
    'Elderly Woman', 'Classy Lady', 'Laborer', 'Young Man', 'Young Woman',
    'Student', 'Sex Worker', 'Thug', 'Jogger', 'Businessman',
    'Businesswoman', 'Gang Member'
  ];

  const SOUND_OPTIONS = {
    'Bicycle Bell': 'https://audio.jukehost.co.uk/gxd2HB9RibSHhr13OiW6ROCaaRbD8103',
    'Arcade Beep': 'https://audio.jukehost.co.uk/iTR4Lk67WCr2npFrZky0u70FIVywhxRr',
    'Notification Ping': 'https://audio.jukehost.co.uk/s9sb6fHZBK8H5zsXk3mufFNUD9YfScp0'
  };

  let AIMTARGETS = [];
  let SELECTED_SOUND = Object.values(SOUND_OPTIONS)[0];

  waitForPageReady().then(() => {
    if ($('#cyclist-div').length > 0) return;

    // === Target Selector ===
    $('.pickpocketing-root > div:first').before(`
      <div id="cyclist-div" style="margin-top: 10px; position: relative;">
        <label style="font-weight: bold;">Select Targets</label>
        <div id="dropdown-wrapper" style="position: relative; width: 100%; margin-top: 4px; margin-bottom: 4px;">
          <div id="dropdown-toggle" style="display: flex; align-items: center; justify-content: space-between; border: 1px solid #9b9b9b; padding: 8px 12px; font-size: 13px; background: linear-gradient(#f4f4f4, #e9e9e9); color: #333; border-radius: 4px; cursor: pointer; box-shadow: inset 0 1px 0 #fff; transition: background 0.2s ease;">
            <span id="dropdown-label">Select targets</span>
            <svg width="12" height="8" viewBox="0 0 12 8" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L6 6L11 1" stroke="#666" stroke-width="2" fill="none" /></svg>
          </div>
          <div id="dropdown-options" style="position: absolute; top: 100%; left: 0; width: 100%; max-height: 200px; overflow: hidden; border: 1px solid #ccc; background: white; z-index: 9999; box-shadow: 0 2px 5px rgba(0,0,0,0.2); display: none;">

  <div id="target-scroll-container" style="max-height: 160px; overflow-y: auto; scrollbar-width: thin;">
    ${TARGET_OPTIONS.map(t => `
      <label style="display: flex; align-items: center; padding: 10px 12px; font-size: 16px; cursor: pointer; border-bottom: 1px solid #f0f0f0;">
        <input type="checkbox" value="${t.toLowerCase()}" style="margin-right: 10px; width: 18px; height: 18px;"> ${t}
      </label>
    `).join('')}
  </div>

  <div id="save-targets" style="padding: 10px 12px; font-size: 14px; color: #007bff; cursor: pointer; text-align: right; border-top: 1px solid #ccc; background: #f9f9f9;">
    Save
  </div>

</div>
        </div>
      </div>
    `);

    let selected = [];

    $('#dropdown-toggle').on('click', function () {
      $('#dropdown-options').toggle();
    });

    $(document).on('click', function (e) {
      if (!$(e.target).closest('#dropdown-wrapper').length) {
        $('#dropdown-options').hide();
      }
    });

    $('#dropdown-options input[type="checkbox"]').on('change', function () {
      selected = $('#dropdown-options input[type="checkbox"]:checked').map(function () {
        return this.value;
      }).get();
      $('#dropdown-label').text(selected.length ? selected.join(', ') : 'Select...');
    });

    $('#dropdown-options').on('click', '#save-targets', function () {
      AIMTARGETS.length = 0;
      Array.prototype.push.apply(AIMTARGETS, selected);

      if (AIMTARGETS.length === 0) {
        alert("Please select at least one target.");
        return;
      }

      $('#save-message').remove();

      $('#dropdown-wrapper').before(`
        <div id="save-message" style="margin-bottom: 6px; padding: 6px 8px; background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; border-radius: 4px; font-size: 12px;">
          Targets saved: ${AIMTARGETS.join(', ')}
        </div>
      `);

      setTimeout(() => { $('#save-message').fadeOut(500, function () { $(this).remove(); }); }, 3000);
      $('#dropdown-options').slideUp(150);
    });

    // === Sound Selector ===
    $('.pickpocketing-root > div:first').before(`
      <div id="sound-div" style="margin-top: 20px; position: relative;">
        <label style="font-weight: bold;">Select Alert Sound</label>
        <div id="sound-dropdown-wrapper" style="position: relative; width: 100%; margin-top: 4px;">
          <div id="sound-dropdown-toggle" style="display: flex; align-items: center; justify-content: space-between; border: 1px solid #9b9b9b; padding: 8px 12px; font-size: 13px; background: linear-gradient(#f4f4f4, #e9e9e9); color: #333; border-radius: 4px; cursor: pointer; box-shadow: inset 0 1px 0 #fff; transition: background 0.2s ease;">
            <span id="sound-dropdown-label">Select Alert Sound</span>
            <svg width="12" height="8" viewBox="0 0 12 8" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L6 6L11 1" stroke="#666" stroke-width="2" fill="none" /></svg>
          </div>
          <div id="sound-dropdown-options" style="position: absolute; top: 100%; left: 0; width: 100%; max-height: 200px; overflow: hidden; border: 1px solid #ccc; background: white; z-index: 9999; box-shadow: 0 2px 5px rgba(0,0,0,0.2); display: none;">

  <div id="sound-scroll-container" style="max-height: 160px; overflow-y: auto;">
    ${Object.entries(SOUND_OPTIONS).map(([label, url]) => `
      <label style="display: flex; align-items: center; padding: 10px 12px; font-size: 16px; cursor: pointer; border-bottom: 1px solid #f0f0f0;">
        <input name="sound-option" type="radio" value="${url}" style="margin-right: 10px; width: 18px; height: 18px;"> ${label}
      </label>
    `).join('')}
  </div>

  <div id="save-sound" style="padding: 10px 12px; font-size: 14px; color: #007bff; cursor: pointer; text-align: right; border-top: 1px solid #ccc; background: #f9f9f9;">
    Save
  </div>

</div>
        </div>
      </div>
    `);

    $('#sound-dropdown-toggle').on('click', function () {
      $('#sound-dropdown-options').toggle();
    });

    $(document).on('click', function (e) {
      if (!$(e.target).closest('#sound-dropdown-wrapper').length) {
        $('#sound-dropdown-options').hide();
      }
    });

    $('#sound-dropdown-options input[name="sound-option"]').on('change', function () {
      const label = $(this).parent().text().trim();
      $('#sound-dropdown-label').text(label);
    });

    $('#sound-dropdown-options').on('click', '#save-sound', function () {
      const selectedRadio = $('#sound-dropdown-options input[name="sound-option"]:checked');
      if (selectedRadio.length === 0) {
        alert("Please select a sound.");
        return;
      }
      SELECTED_SOUND = selectedRadio.val();
      new Audio(SELECTED_SOUND).play();
      $('#sound-dropdown-options').slideUp(150);
    });

    enabled();
  });

  function waitForPageReady() {
    return new Promise(resolve => {
      const check = () => {
        if ($('.pickpocketing-root').length > 0) resolve();
        else setTimeout(check, 500);
      };
      check();
    });
  }

  function getActiveTargets() {
    return $('.CircularProgressbar').nextAll().map(function () {
      return $(this).parent().parent().parent().get(0)?.children[0]?.children[0];
    }).get();
  }

  function enabled() {
    interceptFetch("torn.com", "/page.php?sid=crimesData", (response) => {
      const crimes = response.DB.crimesByType;
      if (isAnyTargetAvailable(crimes, AIMTARGETS)) {
        const audio = new Audio(SELECTED_SOUND);
        audio.play();

        setTimeout(() => {
          getActiveTargets().forEach(target => {
            let $target = $(target);
            let text = target.value || $target.text();
            if (AIMTARGETS.some(t => text.toLowerCase().includes(t))) {
              for (let i = 0; i < 5; i++) {
                $target.css("background-color", "#00ff00");
                $target = $target.parent();
              }
            }
          });
        }, 1000);
      }
    });
  }

  function isAnyTargetAvailable(crimes, targets) {
    return crimes.some(crime =>
      targets.some(t => crime.title.toLowerCase().includes(t)) && crime.available
    );
  }

  function interceptFetch(url, q, callback) {
    const originalFetch = window.fetch;
    window.fetch = function () {
      return originalFetch.apply(this, arguments).then(data => {
        const dataurl = data.url.toString();
        if (dataurl.includes(url) && dataurl.includes(q)) {
          const clone = data.clone();
          if (clone) {
            clone.json().then(response => callback(response)).catch(console.error);
          }
        }
        return data;
      });
    };
  }

})();