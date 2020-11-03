// # Setup stream parts

/*   const context1 = new WebVideo.VideoContext(document.querySelector('canvas'));

  const video1 = context1.createElementSource(document.querySelector('#video1'));
  const video2 = context1.createElementSource(document.querySelector('#video2'));

  const sepia1 = new WebVideo.SepiaNode(context1, {
    amount: 0
  });

  const color2 = new WebVideo.ColorNode(context1, {
    contrast: 0,
    brightness: 0,
    hue: 0,
    saturation: 0
  });

  const fader1 = new WebVideo.DisplacementNode(context1, {
    amount: 0,
    displacement: "./displacement2.jpg"
  }); */

// # Plumb stream together so that data flows appropriately

  // ## fader1 is pulling data from video1 and video2 and pushing data to canvas
  /* video1.connect(sepia1).connect(fader1, 0);
  video2.connect(color2).connect(fader1, 1);
  fader1.connect(context1.destination); */


  const context1 = new WebVideo.VideoContext(document.querySelector('canvas'));
  const video1 = context1.createElementSource(document.querySelector('#video1'));
  const video2 = context1.createElementSource(document.querySelector('#video2'));
  const sepia1 = new WebVideo.SepiaNode(context1);
  const color2 = new WebVideo.ColorNode(context1);
  const fader1 = new WebVideo.FadeNode(context1, { amount: 0 });

  $(document).ready(function () {
    $('#btn').on('click', function() {

      context1.resume();

      video1.connect(sepia1);
      sepia1.connect(fader1, 0);
      video2.connect(color2);
      color2.connect(fader1, 1);

      fader1.connect(context1.destination);

      video1.started.setValueAtTime(true, 0);

  // This section highlights the issues with non-realtime video switching
      // Jump to exactly the same place in the second video
      video1.started.setValueAtTime(false, 5000);
      video2.started.setValueAtTime(true, 5000);
      video2.currentTime.setValueAtTime(function() { return video1.mediaElement.currentTime; }, 5000);
      fader1.amount.setValueAtTime(1, 5000);

      // Jump to exactly the same place in the first video
      video2.started.setValueAtTime(false, 10000);
      video1.started.setValueAtTime(true, 10000);
      video1.currentTime.setValueAtTime(function () { return video2.mediaElement.currentTime; }, 10000);
      fader1.amount.setValueAtTime(0, 10000);

      // Jump to exactly the same place in the second video
      video1.started.setValueAtTime(false, 15000);
      video2.started.setValueAtTime(true, 15000);
      video2.currentTime.setValueAtTime(function () { return video1.mediaElement.currentTime; }, 15000);
      fader1.amount.setValueAtTime(1, 15000);

  // This section is for jumping inside a video
      video2.currentTime.setValueAtTime(30, 18000);
      video2.currentTime.setValueAtTime(60, 20000);
      video2.currentTime.setValueAtTime(90, 22000);
      video2.currentTime.setValueAtTime(120, 24000);
      video2.currentTime.setValueAtTime(150, 26000);
      video2.currentTime.setValueAtTime(180, 28000);

    });
  });




  // ## simple video > canvas
  // video1.connect(canvas1);

  // ## simple video > color change > canvas
  // video2.connect(color2).connect(canvas1);

// # Manage UI controls

  function render() {
    sepia1.amount.value = parseFloat($('.sepia1').val() / 100);
    color2.hue.value = parseFloat($('.hue2').val() / 100);
    color2.contrast.value = parseFloat($('.contrast2').val() / 100);
    color2.brightness.value = parseFloat($('.brightness2').val() / 100);
    color2.saturation.value = parseFloat($('.saturation2').val() / 100);
    //fader1.amount.value = parseFloat($('.amount').val()) / 100;
  }

  $(".control").on("change mousemove", function() {
    render();
  });

  document.onload = render;
  setTimeout(render, 500);
