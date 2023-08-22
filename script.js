#include <pjsr/Sizer.jsh>
#include <pjsr/NumericControl.jsh>
#include <pjsr/FrameStyle.jsh>
#include <pjsr/StdButton.jsh>
#include <pjsr/UndoFlag.jsh>

#define labelWindowTitle "Radu's Narrowband Combiner"
#define labelVersion "1.0"
#define labelTitle "Generate a preview image of all possible narrowband combinations."
#define labelBy "by Radu Marinescu"
#define labelOk "Start"
#define labelCancel "Cancel"
#define labelHaPicker "Ha:   "
#define labelSiiPicker "Sii:   "
#define labelOiiiPicker "Oiii:  "
#define labelHaSelect "Select your Ha view"
#define labelSiiSelect "Select your Sii view"
#define labelOiiiSelect "Select your Oiii view"

#define elementWidth 400
#define elementCount 24 // All SHO combinations without non-distinct elements

var dialog;

var sourceHa;
var sourceSii;
var sourceOiii;

var elementHeight = 0;
var rescaleFactor = 0;

var outputWidth = 0;
var outputHeight = 0;

let filters = [sourceHa, sourceSii, sourceOiii];

function performCalculations(referenceView){
   let imageWidth = referenceView.image.width;
   let imageHeight = referenceView.image.height;

   let ratio = imageWidth / imageHeight;

   elementHeight = elementWidth / ratio;
   rescaleFactor = elementWidth / imageWidth;

   outputWidth = elementWidth * 24 / 6;
   outputHeight = elementHeight * 24 / 4;
}

function resampleView(targetView) {
   var resampler = new Resample;
   resampler.xSize = rescaleFactor;
   resampler.ySize = rescaleFactor;
   resampler.executeOn(targetView);
}

function combineChannels(viewR, viewG, viewB, targetView) {
  var pixelMath = new PixelMath;
  pixelMath.expression = viewR.id;
  pixelMath.expression1 = viewG.id;
  pixelMath.expression2 = viewB.id;
  pixelMath.expression3 = "";
  pixelMath.useSingleExpression = false;
  pixelMath.symbols = "";
  pixelMath.clearImageCacheAndExit = false;
  pixelMath.cacheGeneratedImages = false;
  pixelMath.generateOutput = true;
  pixelMath.singleThreaded = false;
  pixelMath.optimization = true;
  pixelMath.use64BitWorkingImage = false;
  pixelMath.rescale = false;
  pixelMath.rescaleLower = 0;
  pixelMath.rescaleUpper = 1;
  pixelMath.truncate = true;
  pixelMath.truncateLower = 0;
  pixelMath.truncateUpper = 1;
  pixelMath.executeOn(targetView, false);
}



function performProcess() {
   performCalculations(sourceHa);
  let window = new ImageWindow(outputWidth, outputHeight, 3, 32, true, true, "result");

  var pos = 1;
  var posX = 0;
  var posY = 0;

  for (let f1 = 0; f1 < filters.length; f1++) {
    for (let f2 = 0; f2 < filters.length; f2++) {
      for (let f3 = 0; f3 < filters.length; f3++) {
        if (filters[f1].id == filters[f2].id && filters[f2].id == filters[f3].id) {
          continue;
        }

        let abbrv = filters[f1].id + filters[f2].id + filters[f3].id;
        let narrowbandWindow = new ImageWindow(
          sourceHa.image.width,
          sourceHa.image.height,
          3,
          32,
          true,
          true,
          abbrv
        );
        var imageView = narrowbandWindow.mainView;
        var baseView = new View(imageView);
        narrowbandWindow.visible = false;

        imageView.beginProcess(UndoFlag_NoSwapFile);
        combineChannels(filters[f1], filters[f2], filters[f3], baseView);
        resampleView(baseView);
        imageView.endProcess();

        window.mainView.beginProcess(UndoFlag_NoSwapFile);
        window.mainView.image.selectedPoint = new Point(posX, posY);
        window.mainView.image.apply(imageView.image);
        window.mainView.endProcess();
        narrowbandWindow.forceClose();

        if (pos % 4 == 0) {
          posX = 0;
          posY = posY + elementHeight;
        } else {
          posX = posX + elementWidth;
        }
        pos = pos + 1;

        console.write("Combining: " + filters[f1].id + " " + filters[f2].id + " " + filters[f3].id + " ");
      }
    }
  }

  window.visible = true;
}

function ui() {
  this.__base__ = Dialog;
  this.__base__();

  this.userResizable = false;
  this.scaledMinWidth = 400;

  this.windowTitle = labelWindowTitle + " - v" + labelVersion;

  this.titleLabel = new Label(this);
  this.titleLabel.frameStyle = FrameStyle_Sunken;
  this.titleLabel.margin = 10;
  this.titleLabel.wordWrapping = true;
  this.titleLabel.useRichText = true;
  this.titleLabel.text = "<p><b>" + labelTitle + " " + labelVersion + "</b> &mdash; " + labelBy + ".</p>";

  this.selectorHaLabel = new Label(this);
  this.selectorHaLabel.minWidth = 6;
  this.selectorHaLabel.text = labelHaPicker;
  this.selectorHaLabel.textAlignment = 2 | 128;

  this.selectorHaPicker = new ViewList(this);
  this.selectorHaPicker.minWidth = 200;
  this.selectorHaPicker.getAll();
  this.selectorHaPicker.toolTip = labelHaSelect;
  this.selectorHaPicker.onViewSelected = function (view) {
    console.write("Selected '" + view.id + "' for Ha reference.\n");
    sourceHa = view;
  };

  this.groupHa = new HorizontalSizer;
  this.groupHa.spacing = 4;
  this.groupHa.add(this.selectorHaLabel);
  this.groupHa.add(this.selectorHaPicker, 100);

  this.selectorSiiLabel = new Label(this);
  this.selectorSiiLabel.minWidth = 6;
  this.selectorSiiLabel.text = labelSiiPicker;
  this.selectorSiiLabel.textAlignment = 2 | 128;

  this.selectorSiiPicker = new ViewList(this);
  this.selectorSiiPicker.minWidth = 200;
  this.selectorSiiPicker.getAll();
  this.selectorSiiPicker.toolTip = labelSiiSelect;
  this.selectorSiiPicker.onViewSelected = function (view) {
    console.write("Selected '" + view.id + "' for Sii reference.\n");
    sourceSii = view;
  };

  this.groupSii = new HorizontalSizer;
  this.groupSii.spacing = 4;
  this.groupSii.add(this.selectorSiiLabel);
  this.groupSii.add(this.selectorSiiPicker, 100);

  this.selectorOiiiLabel = new Label(this);
  this.selectorOiiiLabel.minWidth = 6;
  this.selectorOiiiLabel.text = labelOiiiPicker;
  this.selectorOiiiLabel.textAlignment = 2 | 128;

  this.selectorOiiiPicker = new ViewList(this);
  this.selectorOiiiPicker.minWidth = 200;
  this.selectorOiiiPicker.getAll();
  this.selectorOiiiPicker.toolTip = labelOiiiSelect;
  this.selectorOiiiPicker.onViewSelected = function (view) {
    console.write("Selected '" + view.id + "' for Oiii reference.\n");
    sourceOiii = view;
  };

  this.groupOiii = new HorizontalSizer;
  this.groupOiii.spacing = 4;
  this.groupOiii.add(this.selectorOiiiLabel);
  this.groupOiii.add(this.selectorOiiiPicker, 100);

  this.groupHSO = new VerticalSizer;
  this.groupHSO.margin = 8;
  this.groupHSO.spacing = 6;
  this.groupHSO.addSpacing(4);
  this.groupHSO.add(this.groupHa);
  this.groupHSO.addSpacing(4);
  this.groupHSO.add(this.groupSii);
  this.groupHSO.addSpacing(4);
  this.groupHSO.add(this.groupOiii);

  this.buttonOk = new PushButton(this);
  this.buttonOk.text = labelOk;
  this.buttonOk.onClick = function () {
    performProcess();
    this.dialog.ok();
  };

  this.buttonCancel = new PushButton(this);
  this.buttonCancel.text = labelCancel;
  this.buttonCancel.onClick = function () {
    this.dialog.cancel();
  };

  this.buttonGroup = new HorizontalSizer;
  this.buttonGroup.add(this.buttonOk);
  this.buttonGroup.addSpacing(10);
  this.buttonGroup.add(this.buttonCancel);

  this.sizer = new VerticalSizer;
  this.sizer.frameStyle = FrameStyle_Box;
  this.sizer.margin = 14;
  this.sizer.spacing = 6;
  this.sizer.addSpacing(4);
  this.sizer.add(this.titleLabel);
  this.sizer.addSpacing(4);
  this.sizer.add(this.groupHSO);
  this.sizer.addSpacing(8);
  this.sizer.add(this.buttonGroup);
  dialog = this;
}

function main() {
  ui.prototype = new Dialog;
  dialog = new ui();
  dialog.execute();
}

main();
