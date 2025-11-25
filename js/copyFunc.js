function InitCopyPaste () {
  const codeBlocks = document.querySelectorAll('div.highlighter-rouge')

  codeBlocks.forEach((codeblock, index) => {
    const code = codeBlocks[index].innerText
    const copyCodeButton = document.createElement('button')
    copyCodeButton.innerHTML = '<i style="pointer-events:none" class="fa fa-clone" aria-hidden="true"></i>'
    // copyCodeButton.style.color = '#DBDBDB';
    // copyCodeButton.style.borderColor = '#252525';
    // copyCodeButton.classList = "btn btn-sm btn-outline-primary";

    // mouseover
    copyCodeButton.addEventListener('mouseover', () => {
      copyCodeButton.style.borderColor = '#DBDBDB'
      copyCodeButton.style.color = '#DBDBDB'
    })

    // mouseout
    copyCodeButton.addEventListener('mouseout', () => {
      copyCodeButton.style.borderColor = '#252525'
      copyCodeButton.style.color = '#DBDBDB'
    })

    // onclick
    copyCodeButton.onclick = function () {
      window.navigator.clipboard.writeText(code)
      copyCodeButton.innerHTML = '<i style="pointer-events:none" class="fa fa-check" aria-hidden="true"></i>'
      copyCodeButton.style.borderColor = 'red'
      copyCodeButton.style.color = '#DBDBDB'
      // copyCodeButton.classList.add("btn-success");
      // copyCodeButton.classList.remove("btn-outline-primary");

      setTimeout(() => {
        copyCodeButton.innerHTML = '<i style="pointer-events:none" class="fa fa-clone" aria-hidden="true"></i>'
        // copyCodeButton.classList.remove("btn-success");
        copyCodeButton.style.backgroundColor = '#252525'
        copyCodeButton.style.borderColor = '#252525'
        copyCodeButton.style.color = '#DBDBDB'
        // copyCodeButton.classList.add("btn-outline-primary");
      }, 500)
    }
    // make the button
    codeblock.appendChild(copyCodeButton)
  })
}

document.addEventListener('DOMContentLoaded', InitCopyPaste)
