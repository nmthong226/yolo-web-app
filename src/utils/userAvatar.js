/* Change user name into avatar */
export const getColor = () => {
    var color = "#5A60AB";
    return color;
};

const getInitials = (name) => {
    let initials;
    const nameSplit = name.split(" ");
    const nameLength = nameSplit.length;
    if (nameLength > 1) {
    initials = nameSplit[0].substring(0, 1) + nameSplit[1].substring(0, 1);
    } else if (nameLength === 1) {
      initials = nameSplit[0].substring(0, 1);
    } else return;

    return initials.toUpperCase();
};

export const createImageFromInitials = (size, name, color = "#2D2F31") => {
    if (name == null) return;
    name = getInitials(name);

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = canvas.height = size;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);

    context.fillStyle = `${color}50`;
    context.fillRect(0, 0, size, size);

    context.fillStyle = color;
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.font = `bold ${size / 2.3}px Arial`;
    context.fillText(name, size / 2, size / 2);

    return canvas.toDataURL();
};