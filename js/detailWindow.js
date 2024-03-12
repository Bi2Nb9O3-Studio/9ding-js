export function displayArtworkInfo(classInfo, name, teacher, description, img) {
    const detailCon = document.createElement("div");
    detailCon.classList.add("detailCon");

    const detailClose = document.createElement("div");
    detailClose.style.display = "block";
    detailClose.style.position = "absolute";
    detailClose.style.width = "10px";
    detailClose.style.height = "10px";
    detailClose.innerText = "X";
    detailClose.style.top = "0";
    detailClose.style.right = "0";
    detailClose.style.background = "#f66";
    detailClose.onclick = closeWindow;
    // detailClose.st
    detailCon.appendChild(detailClose);

    const detailImg = document.createElement("div");
    detailImg.classList.add("detailImg");
    detailImg.id = "imageContainer";

    const artworkImage = document.createElement("img");
    artworkImage.src = img.src;
    artworkImage.id = "artworkImage";
    artworkImage.style.backgroundColor = "#f4f4f4";
    artworkImage.onclick = zoomImage;

    const rotateButton = document.createElement("button");
    rotateButton.classList.add("rotateButton");
    rotateButton.textContent = "Rotate";
    rotateButton.onclick = rotateImage;

    detailImg.appendChild(artworkImage);
    detailImg.appendChild(rotateButton);

    const detailText = document.createElement("div");
    detailText.classList.add("detailText");

    const table = document.createElement("table");
    const tbody = document.createElement("tbody");

    const rowData = [
        { title: "学生班级", value: classInfo },
        { title: "姓名", value: name },
        { title: "指导老师", value: teacher },
        { title: "介绍", value: description },
    ];

    rowData.forEach((data) => {
        const row = document.createElement("tr");
        const th = document.createElement("th");
        th.textContent = data.title;
        const td = document.createElement("td");
        td.textContent = data.value;

        row.appendChild(th);
        row.appendChild(td);
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    detailText.appendChild(table);

    detailCon.appendChild(detailImg);
    detailCon.appendChild(detailText);

    const detail = document.createElement("div");
    detail.classList.add("detail");
    detail.appendChild(detailCon);

    document.body.appendChild(detail);
    console.log(detailCon);
}

let rotation = 0;

function rotateImage() {
    rotation += 90;
    document.getElementById(
        "artworkImage"
    ).style.transform = `rotate(${rotation}deg)`;
    adjustMargin(rotation);
}

function zoomImage() {
    let imageContainer = document.getElementById("imageContainer");
    if (!imageContainer.classList.contains("zoomed")) {
        imageContainer.classList.add("zoomed");
    } else {
        imageContainer.classList.remove("zoomed");
    }
}

function adjustMargin(rotation) {
    let detailImg = document.querySelector(".detailImg");
    if (rotation % 180 !== 0) {
        detailImg.style.width =
            document.getElementById("artworkImage").offsetHeight + 20 + "px";
    } else {
        detailImg.style.width =
            document.getElementById("artworkImage").offsetWidth + 10 + "px";
    }
}

function closeWindow() {
    // 获取所有具有类名为 "detailCon" 的元素
    let elements = document.querySelectorAll(".detail");

    // 遍历所有匹配的元素并删除它们
    elements.forEach((element) => {
        element.remove();
    });
}
