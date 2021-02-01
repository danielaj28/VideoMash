const fs = require("fs");
var path = require("path");

var args = process.argv.slice(2);

if (args.length != 2) {
  console.log(
    "Command accepts 2 arguments; first being path to the bin folder and the second being the location to save the project file"
  );
  console.debug(args);
  return;
}

let [binPath, projPath] = args;
projPath = (path.resolve(projPath) + "/proj.mlt").replace(/\\/g, "/");
console.log(`Bin Location: ${binPath}`);
console.log(`Project File Location: ${projPath}`);

let data = `<?xml version="1.0" standalone="no"?>
<mlt LC_NUMERIC="C" version="6.23.0" title="Shotcut version 20.10.31" producer="main_bin">
  <profile description="PAL 4:3 DV or DVD" width="1920" height="1080" progressive="1" sample_aspect_num="1" sample_aspect_den="1" display_aspect_num="16" display_aspect_den="9" frame_rate_num="30" frame_rate_den="1" colorspace="709"/>
  `;

let videoFiles = [];

fs.readdirSync(binPath).forEach((file) => {
  videoFiles.push((path.resolve(binPath) + "/" + file).replace(/\\/g, "/"));
});

console.log(`${videoFiles.length} files found in bin`);

let count = 0;

videoFiles.forEach((path) => {
  data += `<producer id="producer${count}">
    <property name="resource">${path}</property>
  </producer>`;
  count++;
});

data += `<playlist id="main_bin" title="Shotcut version 20.10.31">
<property name="shotcut:projectAudioChannels">2</property>
<property name="shotcut:projectFolder">0</property>
<property name="xml_retain">1</property>
`;

let producers = "";

for (let index = 0; index < videoFiles.length; index++) {
  producers += `<entry producer="producer${index}"/>`;
}

data += producers;

data += `</playlist>
<producer id="black">
  <property name="eof">pause</property>
  <property name="resource">0</property>
  <property name="aspect_ratio">1</property>
  <property name="mlt_service">color</property>
  <property name="mlt_image_format">rgb24a</property>
  <property name="set.test_audio">0</property>
</producer>
<playlist id="background">
  <entry producer="black"/>
</playlist>
<playlist id="playlist0">
  <property name="shotcut:video">1</property>
  <property name="shotcut:name">V1</property>
  `;

data += producers;

data += `
  </playlist>
  <tractor id="tractor0" title="Shotcut version 20.10.31" global_feed="1">
    <property name="shotcut">1</property>
    <property name="shotcut:projectAudioChannels">2</property>
    <property name="shotcut:projectFolder">0</property>
    <track producer="background"/>
    <track producer="playlist0"/>
  </tractor>
</mlt>`;

try {
  fs.writeFileSync(projPath, data);
  console.log("Success in creating project file!");
} catch (err) {
  console.error(`Error: ${err}`);
}
