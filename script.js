#include <pjsr/Sizer.jsh>
#include <pjsr/NumericControl.jsh>
#include <pjsr/FrameStyle.jsh>
#include <pjsr/StdButton.jsh>

#define labelWindowTitle "Radu's Narrowband Combiner"
#define labelVersion "1.0"
#define labelTitle "Generate a preview image of all possible narrowband combinations."
#define labelBy "by Radu Marinescu"
#define labelOk "Start"
#define labelCancel "Cancel"

var dialog;

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
   this.titleLabel.useRichText  = true;
   this.titleLabel.text = "<p><b>" + labelTitle + " " + labelVersion + "</b> &mdash; " + labelBy + ".</p>";

   this.buttonOk = new PushButton(this);
   this.buttonOk.text = labelOk;
   this.buttonOk.onClick = function () {
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
   this.sizer.addSpacing(8);
   this.sizer.add(this.buttonGroup);
   dialog = this;
}

function main(){
   ui.prototype = new Dialog;
   dialog = new ui();
   dialog.execute();
}

main();
