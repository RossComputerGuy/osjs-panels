/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2019, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

import {h} from 'hyperapp';
import PanelItem from '../panel-item';
import * as languages from '../locales';

// const menuIcon = require('../logo-white-32x32.png');
const menuIcon = require('../logo-blue-32x32.png');
const defaultIcon = require('../logo-blue-32x32.png');
const sortBy = fn => (a, b) => -(fn(a) < fn(b)) || +(fn(a) > fn(b));
const sortByLabel = iter => String(iter.label).toLowerCase();

const getIcon = (core, m) => m.icon
  ? (m.icon.match(/^(https?:)\//)
    ? m.icon
    : core.url(m.icon, {}, m))
  : defaultIcon;

const getTitle = (locale, item) => locale
  .translatableFlat(item.title, item.name);

const getCategory = (locale, cat) => locale
  .translate(cat);

const makeTree = (core, __, metadata) => {
  const configuredCategories = core.config('application.categories');
  const categories = {};
  const locale = core.make('osjs/locale');

  metadata.filter(m => m.hidden !== true).forEach((m) => {
    const cat = Object.keys(configuredCategories).find(c => c === m.category) || 'other';
    const found = configuredCategories[cat];

    if (!categories[cat]) {
      categories[cat] = {
        icon: found.icon ? {name: found.icon} : defaultIcon,
        label: getCategory(locale, found.label),
        items: []
      };
    }

    categories[cat].items.push({
      icon: getIcon(core, m),
      label: getTitle(locale, m),
      data: {
        name: m.name
      }
    });
  });

  Object.keys(categories).forEach(k => {
    categories[k].items.sort(sortBy(sortByLabel));
  });
  return [...Object.values(categories)];
};

/**
 * Menu
 *
 * @desc Menu Panel Item
 */
export default class MenuPanelItem extends PanelItem {

  render(state, actions) {
    const _ = this.core.make('osjs/locale').translate;
    const __ = this.core.make('osjs/locale').translatable(languages);

    const onclick = (ev) => {
      const packages = this.core.make('osjs/packages')
        .getPackages(m => (!m.type || m.type === 'application'));

      this.core.make('osjs/contextmenu').show({
        menu: makeTree(this.core, __, [].concat(packages)),
        position: ev.target,
        callback: (item) => {
          const {name} = item.data || {};

          if (name) {
            this.core.run(name);
          }
        }
      });
    };

    return super.render('menu', [
      h('div', {
        class: 'osjs-panelitem-menu',
        onclick,
        style: {
          backgroundImage: `url(${menuIcon})`
        }
      }, h('span', {}, _('LBL_MENU')))
    ]);
  }

}
