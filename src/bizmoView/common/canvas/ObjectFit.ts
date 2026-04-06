import Konva from 'konva';

/**
 * object-fit のような挙動をする
 * @param image
 * @param container
 * @returns
 */
export function fitImageToObject(
    mode: 'contain' | 'cover',
    image:
        | Konva.Image
        | HTMLImageElement
        | {
              width: number;
              height: number;
          },
    container: {
        width: number;
        height: number;
    }
): {
    width: number;
    height: number;
    x: number;
    y: number;
    scale: number;
} {
    const imageW = image instanceof Konva.Image ? image.width() : image.width;
    const imageH = image instanceof Konva.Image ? image.height() : image.height;
    const imageRatio = imageW / imageH;
    const containerRatio = container.width / container.height;

    let newWidth: number;
    let newHeight: number;

    switch (mode) {
        case 'cover':
            if (imageRatio > containerRatio) {
                // 画像の高さをコンテナの高さに合わせ、幅をオーバーフローさせる
                newHeight = container.height;
                newWidth = newHeight * imageRatio;
            } else {
                // 画像の幅をコンテナの幅に合わせ、高さをオーバーフローさせる
                newWidth = container.width;
                newHeight = newWidth / imageRatio;
            }
            break;
        case 'contain':
            if (imageRatio > containerRatio) {
                // 画像の幅をコンテナの幅に合わせる
                newWidth = container.width;
                newHeight = newWidth / imageRatio;
            } else {
                // 画像の高さをコンテナの高さに合わせる
                newHeight = container.height;
                newWidth = newHeight * imageRatio;
            }
            break;
    }

    return {
        width: newWidth,
        height: newHeight,
        x: (container.width - newWidth) / 2,
        y: (container.height - newHeight) / 2,
        scale: newWidth / imageW,
    };
}
