class JView {

	constructor(container, build) {

		this._dom = {};
		this._dom.container = container;
		this._dom.container.classList.add("jv");

		if (build !== false) {

			this.build(JSON.parse(this._dom.container.textContent.trim()), null, 1);

		}

	}

	build(json, maxLvl, colAt) {

		maxLvl = typeof maxLvl === "number" ? maxLvl : -1;
		colAt = typeof colAt === "number" ? colAt : -1;

		const jsonData = this._processInput(json),
			walkEl = this._walk(jsonData, maxLvl, colAt, 0);

		this._dom.container.innerHTML = "";
		this._dom.container.appendChild(walkEl);

	}

	_processInput(json) {

		if (json && typeof json === "object") {

			return json;

		} else {

			throw "Input value is not object or array!";

		}

	}

	_walk(value, maxLvl, colAt, lvl) {

		const frag = document.createDocumentFragment(),
			isMaxLvl = maxLvl >= 0 && lvl >= maxLvl,
			isCollapse = colAt >= 0 && lvl >= colAt;

		switch (typeof value) {

			case "object":

				if (!value) {

					break;

				}

				const isArray = Array.isArray(value),
					items = isArray ? value : Object.keys(value);

				if (lvl === 0) {

					const rootCount = this._createItemsCount(items.length),
						rootLink = this._createLink(isArray ? "[" : "{");

					if (items.length) {

						rootLink.addEventListener("click", function () {

							if (isMaxLvl) {

								return;

							}

							rootLink.classList.toggle("collapsed");
							rootCount.classList.toggle("hide");

							this._dom.container.querySelector("ul").classList.toggle("hide");

						}.bind(this));

						if (isCollapse) {

							rootLink.classList.add("collapsed");
							rootCount.classList.remove("hide");

						}

					} else {

						rootLink.classList.add("empty");

					}

					rootLink.appendChild(rootCount);
					frag.appendChild(rootLink);

				}

				if (items.length && !isMaxLvl) {

					const len = items.length - 1,
						ulList = document.createElement("ul");

					ulList.setAttribute("data-level", lvl);
					ulList.classList.add("type-" + (isArray ? "array" : "object"));

					items.forEach(function (key, ind) {

						const item = isArray ? key : value[key],
							li = document.createElement("li");

						if (typeof item === "object") {

							let isEmpty = false;

							if (!item || item instanceof Date) {

								li.appendChild(document.createTextNode(isArray ? "" : key + ": "));
								li.appendChild(this._createSimple(item ? item : null));

							} else {

								const itemIsArray = Array.isArray(item),
									itemLen = itemIsArray ? item.length : Object.keys(item).length;

								if (!itemLen) {

									li.appendChild(document.createTextNode(key + ": " + (itemIsArray ? "[]" : "{}")));

								} else {

									const itemTitle = (typeof key === "string" ? key + ": " : "") + (itemIsArray ? "[" : "{"),
										itemLink = this._createLink(itemTitle),
										itemsCount = this._createItemsCount(itemLen);

									if (maxLvl >= 0 && lvl + 1 >= maxLvl) {

										li.appendChild(document.createTextNode(itemTitle));

									} else {

										itemLink.appendChild(itemsCount);
										li.appendChild(itemLink);

									}

									li.appendChild(this._walk(item, maxLvl, colAt, lvl + 1));
									li.appendChild(document.createTextNode(itemIsArray ? "]" : "}"));

									const list = li.querySelector("ul"),
										itemLinkCb = function () {

											itemLink.classList.toggle("collapsed");
											itemsCount.classList.toggle("hide");
											list.classList.toggle("hide");

										};

									itemLink.addEventListener("click", itemLinkCb);

									if (colAt >= 0 && lvl + 1 >= colAt) {

										itemLinkCb();

									}

								}

							}

						} else {

							if (!isArray) {

								li.appendChild(document.createTextNode(key + ": "));

							}

							li.appendChild(this._walk(item, maxLvl, colAt, lvl + 1));

						}

						if (ind < len) {

							li.appendChild(document.createTextNode(","));

						}

						ulList.appendChild(li);

					}, this);

					frag.appendChild(ulList);

				} else if (items.length && isMaxLvl) {

					const itemsCount = this._createItemsCount(items.length);

					itemsCount.classList.remove("hide");

					frag.appendChild(itemsCount);

				}

				if (lvl === 0) {

					if (!items.length) {

						const itemsCount = this._createItemsCount(0);

						itemsCount.classList.remove("hide");

						frag.appendChild(itemsCount);

					}

					frag.appendChild(document.createTextNode(isArray ? "]" : "}"));

					if (isCollapse) {

						frag.querySelector("ul").classList.add("hide");

					}

				}

				break;

			default:

				frag.appendChild(this._createSimple(value));

				break;

		}

		return frag;

	}

	_createSimple(value) {

		const spanEl = document.createElement("span");

		let type = typeof value,
			txt = value;

		if (type === "string") {

			txt = '"' + value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '"';

		} else if (value === null) {

			type = "null";
			txt = "null";

		} else if (value === undefined) {

			txt = "undefined";

		} else if (value instanceof Date) {

			type = "date";
			txt = value.toString();

		}

		spanEl.classList.add("type-" + type);
		spanEl.innerHTML = txt;

		return spanEl;

	}

	_createItemsCount(count) {

		const itemsCount = document.createElement("span");

		itemsCount.classList.add("items-ph");
		itemsCount.classList.add("hide");
		itemsCount.innerHTML = this._getItemsTitle(count);

		return itemsCount;

	}

	_createLink(title) {

		const linkEl = document.createElement("a");

		linkEl.classList.add("list-link");
		linkEl.href = "javascript:void(0)";
		linkEl.innerHTML = title || "";

		return linkEl;

	}

	_getItemsTitle(count) {

		const itemsTxt = count > 1 || count === 0 ? "items" : "item";

		return (count + " " + itemsTxt);

	}

}
