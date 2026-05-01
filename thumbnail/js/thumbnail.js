(function () {
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function chance(percent) {
    return Math.random() < (percent / 100);
  }

  var caretChancePercent = 55;
  var reorderChancePercent = 55;

  function pickDifferentIndex(length, previousIndex) {
    if (length <= 1) return 0;
    var nextIndex = previousIndex;
    while (nextIndex === previousIndex) {
      nextIndex = randomInt(0, length - 1);
    }
    return nextIndex;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getThemeCursorColor(paper) {
    if (paper.classList.contains("theme-blue")) return "#2563eb";
    if (paper.classList.contains("theme-emerald")) return "#059669";
    if (paper.classList.contains("theme-violet")) return "#7c3aed";
    return "#111827";
  }

  function createCursorElement(paper) {
    var cursor = document.createElement("div");
    cursor.className = "cv-mouse-cursor";
    cursor.style.color = getThemeCursorColor(paper);
    cursor.innerHTML =
      '<span class="cursor-glyph">' +
      '<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M20.5056 10.7754C21.1225 10.5355 21.431 10.4155 21.5176 10.2459C21.5926 10.099 21.5903 9.92446 21.5115 9.77954C21.4205 9.61226 21.109 9.50044 20.486 9.2768L4.59629 3.5728C4.0866 3.38983 3.83175 3.29835 3.66514 3.35605C3.52029 3.40621 3.40645 3.52004 3.35629 3.6649C3.29859 3.8315 3.39008 4.08635 3.57304 4.59605L9.277 20.4858C9.50064 21.1088 9.61246 21.4203 9.77973 21.5113C9.92465 21.5901 10.0991 21.5924 10.2461 21.5174C10.4157 21.4308 10.5356 21.1223 10.7756 20.5054L13.3724 13.8278C13.4194 13.707 13.4429 13.6466 13.4792 13.5957C13.5114 13.5506 13.5508 13.5112 13.5959 13.479C13.6468 13.4427 13.7072 13.4192 13.828 13.3722L20.5056 10.7754Z" fill="currentColor" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>" +
      "</span>";
    paper.appendChild(cursor);
    return cursor;
  }

  function setCursorPosition(cvState, x, y, instant) {
    var maxX = cvState.paper.clientWidth - 26;
    var maxY = cvState.paper.clientHeight - 26;
    var clampedX = clamp(x, 0, Math.max(0, maxX));
    var clampedY = clamp(y, 0, Math.max(0, maxY));

    cvState.cursorPosition.x = clampedX;
    cvState.cursorPosition.y = clampedY;

    if (instant) {
      var previousTransition = cvState.cursor.style.transition;
      cvState.cursor.style.transition = "none";
      cvState.cursor.style.transform = "translate(" + clampedX + "px, " + clampedY + "px)";
      cvState.cursor.getBoundingClientRect();
      cvState.cursor.style.transition = previousTransition;
      return;
    }

    cvState.cursor.style.transform = "translate(" + clampedX + "px, " + clampedY + "px)";
  }

  function getElementLocalRect(cvState, element) {
    var localX = 0;
    var localY = 0;
    var node = element;

    while (node && node !== cvState.paper) {
      localX += node.offsetLeft || 0;
      localY += node.offsetTop || 0;
      node = node.offsetParent;
    }

    if (node !== cvState.paper) {
      var paperRect = cvState.paper.getBoundingClientRect();
      var fallbackRect = element.getBoundingClientRect();
      localX = fallbackRect.left - paperRect.left;
      localY = fallbackRect.top - paperRect.top;
    }

    var width = element.offsetWidth || element.clientWidth;
    var height = element.offsetHeight || element.clientHeight;

    if (!width || !height) {
      var measuredRect = element.getBoundingClientRect();
      width = width || measuredRect.width;
      height = height || measuredRect.height;
    }

    return {
      x: localX,
      y: localY,
      width: width,
      height: height
    };
  }

  function pointForElement(cvState, element) {
    var localRect = getElementLocalRect(cvState, element);
    var isSection = element.classList && element.classList.contains("cv-section");
    var xOffset = isSection ? 18 : Math.min(18, Math.max(8, localRect.width * 0.18));
    var yOffset = isSection ? 18 : Math.min(24, Math.max(12, localRect.height * 0.65));
    var tipX = localRect.x + xOffset;
    var tipY = localRect.y + yOffset;

    return {
      x: tipX - 20 + randomInt(-4, 4),
      y: tipY - 10 + randomInt(-3, 3)
    };
  }

  async function moveCursorToPoint(cvState, x, y, minDuration, maxDuration, jitter) {
    var duration = randomInt(minDuration || 220, maxDuration || 420);
    var jitterAmount = jitter || 0;
    var nextX = x + (jitterAmount ? randomInt(-jitterAmount, jitterAmount) : 0);
    var nextY = y + (jitterAmount ? randomInt(-jitterAmount, jitterAmount) : 0);

    cvState.cursor.classList.add("is-visible");
    cvState.cursor.style.transition =
      "transform " + duration + "ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 180ms ease";

    setCursorPosition(cvState, nextX, nextY, false);
    await wait(duration + randomInt(16, 40));
  }

  async function moveCursorToElement(cvState, element, minDuration, maxDuration) {
    var destination = pointForElement(cvState, element);
    await moveCursorToPoint(cvState, destination.x, destination.y, minDuration, maxDuration, 1);
  }

  function beginCursorDrag(cvState) {
    cvState.cursor.classList.add("is-dragging");
  }

  async function endCursorDrag(cvState) {
    await wait(randomInt(35, 80));
    cvState.cursor.classList.remove("is-dragging");
  }

  async function clickCursor(cvState) {
    cvState.cursor.classList.add("is-clicking");
    await wait(randomInt(95, 165));
    cvState.cursor.classList.remove("is-clicking");
    await wait(randomInt(35, 80));
  }

  function parseVariants(value) {
    return value
      .split("|")
      .map(function (part) { return part.trim(); })
      .filter(function (part) { return part.length > 0; });
  }

  async function eraseText(textNode) {
    while (textNode.textContent.length > 0) {
      textNode.textContent = textNode.textContent.slice(0, -1);
      await wait(randomInt(16, 34));
    }
  }

  async function typeText(textNode, value) {
    for (var i = 1; i <= value.length; i += 1) {
      textNode.textContent = value.slice(0, i);
      await wait(randomInt(22, 46));
    }
  }

  function initializeSectionGroups(paper) {
    var sections = Array.from(paper.children).filter(function (child) {
      return child.classList && child.classList.contains("cv-section");
    });

    return sections.map(function (section) {
      var group = document.createElement("div");
      group.className = "cv-section-group";

      var hr = section.previousElementSibling;
      if (hr && hr.classList && hr.classList.contains("cv-hr")) {
        paper.insertBefore(group, hr);
        group.appendChild(hr);
        group.appendChild(section);
      } else {
        paper.insertBefore(group, section);
        group.appendChild(section);
      }

      return group;
    });
  }

  async function playSectionReorderAnimation(cvState) {
    var groups = cvState.sectionGroups;
    if (!groups || groups.length < 2) return;

    var fromIndex = randomInt(0, groups.length - 1);
    var toIndex = pickDifferentIndex(groups.length, fromIndex);
    var firstPositions = new Map();
    var selectedGroup = groups[fromIndex];
    var selectedSection = selectedGroup.querySelector(".cv-section");
    var movedDeltaY = 0;
    var movedDuration = 1180;

    if (!selectedSection) return;

    await moveCursorToElement(cvState, selectedSection, 180, 340);
    beginCursorDrag(cvState);

    var dragStartPoint = {
      x: cvState.cursorPosition.x,
      y: cvState.cursorPosition.y
    };

    selectedSection.classList.add("is-highlighted");
    selectedSection.classList.add("is-lifted");
    selectedSection.style.transition = "background-color 0.32s ease";
    selectedSection.style.transform = "none";
    await wait(randomInt(420, 650));

    groups.forEach(function (group) {
      firstPositions.set(group, group.getBoundingClientRect().top);
    });

    var nextOrder = groups.slice();
    var movedGroup = nextOrder.splice(fromIndex, 1)[0];
    nextOrder.splice(toIndex, 0, movedGroup);

    nextOrder.forEach(function (group) {
      cvState.paper.appendChild(group);
    });

    nextOrder.forEach(function (group) {
      var firstTop = firstPositions.get(group);
      var lastTop = group.getBoundingClientRect().top;
      var deltaY = firstTop - lastTop;

      if (group === movedGroup) {
        movedDeltaY = deltaY;
      }

      group.style.transition = "none";
      group.style.transform = "translateY(" + deltaY + "px)";
      group.classList.add("is-reordering");
    });

    cvState.paper.getBoundingClientRect();

    nextOrder.forEach(function (group) {
      var isMoved = group === movedGroup;
      var duration = isMoved ? movedDuration : 1040;
      var easing = isMoved ? "cubic-bezier(0.22, 0.61, 0.36, 1)" : "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      group.style.transition = "transform " + duration + "ms " + easing;
      group.style.transform = "translateY(0)";
    });

    var cursorDragPromise = moveCursorToPoint(
      cvState,
      dragStartPoint.x + randomInt(-1, 1),
      dragStartPoint.y - movedDeltaY + randomInt(-1, 1),
      movedDuration,
      movedDuration,
      0
    );

    await Promise.all([cursorDragPromise, wait(movedDuration + 40)]);
    await endCursorDrag(cvState);

    selectedSection.style.transition = "background-color 0.24s ease";
    selectedSection.style.transform = "none";
    selectedSection.classList.remove("is-lifted");
    await wait(380);

    nextOrder.forEach(function (group) {
      var section = group.querySelector(".cv-section");

      group.style.transition = "";
      group.style.transform = "";
      group.classList.remove("is-reordering");

      if (section) {
        section.style.transition = "";
        section.style.transform = "";
        section.classList.remove("is-highlighted");
        section.classList.remove("is-lifted");
      }
    });

    cvState.sectionGroups = nextOrder;
  }

  var cvStates = Array.from(document.querySelectorAll(".cv-paper")).map(function (paper, cvIndex) {
    var sectionGroups = initializeSectionGroups(paper);
    var cursor = createCursorElement(paper);

    var targets = Array.from(paper.querySelectorAll(".inline-edit[data-type-variants]")).map(function (el) {
      var variants = parseVariants(el.getAttribute("data-type-variants") || "");
      var textNode = el.querySelector(".type-text");
      var variantIndex = randomInt(0, Math.max(variants.length - 1, 0));

      if (textNode && variants.length > 0) {
        textNode.textContent = variants[variantIndex];
      }

      return {
        el: el,
        textNode: textNode,
        variants: variants,
        variantIndex: variantIndex
      };
    }).filter(function (target) {
      return target.textNode && target.variants.length > 0;
    });

    var cvState = {
      id: cvIndex,
      paper: paper,
      cursor: cursor,
      cursorPosition: { x: 0, y: 0 },
      targets: targets,
      sectionGroups: sectionGroups,
      activeTargetIndex: -1
    };

    setCursorPosition(
      cvState,
      randomInt(16, Math.max(18, paper.clientWidth - 46)),
      randomInt(16, Math.max(18, paper.clientHeight - 46)),
      true
    );

    cursor.classList.add("is-visible");

    return cvState;
  }).filter(function (cvState) {
    return cvState.targets.length > 0;
  });

  if (!cvStates.length) return;

  function chooseTargetIndex(cvState) {
    var targetCount = cvState.targets.length;
    var candidates = [];
    var i;
    for (i = 0; i < targetCount; i += 1) {
      if (i !== cvState.activeTargetIndex) {
        candidates.push(i);
      }
    }

    if (candidates.length === 0) {
      candidates.push(0);
    }

    var otherIndexes = cvStates
      .filter(function (other) { return other.id !== cvState.id; })
      .map(function (other) { return other.activeTargetIndex; })
      .filter(function (value) { return value >= 0; });

    var filtered = candidates.filter(function (candidate) {
      if (otherIndexes.length !== cvStates.length - 1) return true;
      return !otherIndexes.every(function (value) { return value === candidate; });
    });

    var pool = filtered.length > 0 ? filtered : candidates;
    return pool[randomInt(0, pool.length - 1)];
  }

  async function animateCV(cvState) {
    await wait(randomInt(150, 1100));

    while (true) {
      var targetIndex = chooseTargetIndex(cvState);
      cvState.activeTargetIndex = targetIndex;

      var target = cvState.targets[targetIndex];
      await moveCursorToElement(cvState, target.el, 210, 460);
      await clickCursor(cvState);

      target.el.classList.add("is-active");

      if (chance(caretChancePercent)) {
        target.el.classList.add("show-caret");
      } else {
        target.el.classList.remove("show-caret");
      }

      await wait(randomInt(280, 760));

      if (chance(reorderChancePercent)) {
        await playSectionReorderAnimation(cvState);
        await moveCursorToElement(cvState, target.el, 170, 320);
        await clickCursor(cvState);
      }

      var nextVariantIndex = pickDifferentIndex(target.variants.length, target.variantIndex);
      var nextText = target.variants[nextVariantIndex];

      await eraseText(target.textNode);
      await wait(randomInt(120, 220));
      await typeText(target.textNode, nextText);

      target.variantIndex = nextVariantIndex;

      await wait(randomInt(850, 1800));
      target.el.classList.remove("show-caret");
      target.el.classList.remove("is-active");
      await wait(randomInt(260, 780));
    }
  }

  cvStates.forEach(function (cvState, index) {
    window.setTimeout(function () {
      animateCV(cvState);
    }, index * 340);
  });
})();
