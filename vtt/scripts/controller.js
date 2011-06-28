/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * TODO LIST
 *
 * Fix video-with-captions preview
 * Clear input after user puts in a subtitle
 * Add keyboard input controls
 * Cool styling of captions
 * Dynamic length setting
 */

/**
 * The Controller object
 * This is used to wire up the view and model with actions
 */ 
var Controller = {

    // Setup the controller 
	init:function() {
        // Set some defaults up in the "video" dialog
        $("#input-url-mp4").attr("value","http://www.delphiki.com/html5/playr/examples/dw_trailer_low.mp4");
        $("#input-url-ogg").attr("value","http://www.delphiki.com/html5/playr/examples/dw_trailer_low.ogg");
    
        // Create new caption set
        this.captions = [];
        // Hide the caption editing tools until we have a video
        $("#captionTrigger").hide(); 
        $("#captionTools").hide();
	},
    
    select: function(){
    },
    
    // Called when the user wants to pause the video
    // and write a caption. Enables the caption editing controls.
    startCaption: function(){
        this.video.pause();
        this.now = this.video.currentTime;
        $("#captionTrigger").hide();       
        $("#captionTools").show();
    },
    
    // Called when the user has finished writing a caption
    // Saves the caption and resumes the video
    endCaption: function(){
        var caption = {};
        caption.text = document.getElementById('captionText').value;
        // We start the captioning 250 milliseconds before the current frame
        caption.start = this.formatDate(this.now * 1000 - 250);
        // We end the caption 2 seconds after the caption start 
        caption.end = this.formatDate((this.now + 2) * 1000);
        this.captions.push(caption);
        this.updateCaptions();
        $("#captionTrigger").show();
        $("#captionTools").hide();
        this.video.play();
    },
    
    // Called if the user cancels writing a caption
    cancelCaption: function(){
        $("#captionTrigger").show();
        $("#captionTools").hide();
        
        this.video.play();        
    },
    
    // Update the Web-VTT serialization of the captions
    updateCaptions: function(){
        var vtt = "WEBVTT FILE";
        for(i=0;i<this.captions.length;i++){
            vtt += "\n";
            var x = i + 1;
            vtt += "\n" + x;
            vtt += "\n" + this.captions[i].start +" --> " + this.captions[i].end;
            vtt += "\n" +this.captions[i].text;
        }
        document.getElementById('vtt_out').innerHTML = vtt;
    },
    
    // Turns a JS date into a Web-VTT timestamp
    formatDate: function(inputDate){
        var date = new Date(inputDate);
        var timestamp;
        if (date.getHours() < 10){
            timestamp = "0"+date.getHours();
        } else {
            timestamp = date.getHours();        
        }
        timestamp +=":";
        if (date.getMinutes() < 10){
            timestamp += "0"+date.getMinutes();
        } else {
            timestamp += date.getMinutes();        
        }
        timestamp +=":";
        if (date.getSeconds() < 10){
            timestamp += "0"+date.getSeconds();
        } else {
            timestamp += date.getSeconds();        
        }
        timestamp += ".";
        if (date.getMilliseconds() < 100){
            timestamp += "0";
        }
        timestamp += date.getMilliseconds();
        return timestamp;
    },
    
    // Called when OK is clicked in the add video dialog
    setVideo: function(){
        // Get the form values
        var video_src_mp4 = $("#input-url-mp4").attr("value");
        var video_src_ogg = $("#input-url-ogg").attr("value");

        // Set the video if there is at least one src value        
        if (video_src_mp4 != "" || video_src_ogg != ""){
            this.resetVideo(video_src_mp4,video_src_ogg, null);
        
            // Make the caption trigger visible only if there is a valid video
            $("#captionTrigger").show();
        }
        
        // Close the dialog
        $.mobile.changePage("#home", "pop", true);
    },
    
    // Reset the preview dialog
    preview: function(){
    
        // Create video tag
        var video_src_mp4 = $("#input-url-mp4").attr("value");
        var video_src_ogg = $("#input-url-ogg").attr("value");
        var track_src = "data:text/plain,"+"\n"+$("#vtt_out").val();
        var video = this.createVideoTag(video_src_mp4, video_src_ogg, track_src);
        
        // Remove any existing preview
        $('#video_preview_container').empty();
        
        // Set video tag in the preview container
        $('#video_preview_container').append(video); 
           
        // Update video tags using Playr
        this.updateVideoTags();    
    },

    // Reset the video selection
    resetVideo: function(video_src_mp4, video_src_ogg, track_src){
        
        // Remove placeholder
        $("#no-video").remove();
    
        // Remove old video
        $("#video_container").empty();
        
        // Create video tag
        var video = this.createVideoTag(video_src_mp4, video_src_ogg, track_src);

        // Set video tag in the container
        $('#video_container').append(video);

        this.video = document.getElementsByTagName('video')[0];
        
        // Update video tags using Playr
        // this.updateVideoTags();

    },
    
    // Create a video tag
    createVideoTag: function(video_src_mp4, video_src_ogg, track_src){
    
        // Create video tag
        var video = $(document.createElement('video'))
        .attr('id', 'video')
        .attr('controls', 'controls')
        .attr('class','playr_video');
        
        // Create source tags
        var mp4source = $(document.createElement('source')) 
        .attr('type','video/mp4')
        .attr('src', video_src_mp4);
        video.append(mp4source);
        var oggsource = $(document.createElement('source')) 
        .attr('type','video/ogg')
        .attr('src', video_src_ogg);
        video.append(oggsource);
        
        // Create subtitle tag 
        if (track_src){       
            var track = $(document.createElement('track'))
            .attr('kind', 'subtitles')
            .attr('label', 'WebVTT')
            .attr('src', track_src)
            .attr('srclang', 'en')
            video.append(track);
        }
        
        return video;
    },
    
    // NOTE I've removed this capability as its not clear what the license
    // is for Playr.
    //
    // Tell Playr to update all video tags in the app
    updateVideoTags: function(){
        var video_tags = document.querySelectorAll('video.playr_video');
        var video_objects = [];
        for(v = 0; v < video_tags.length; v++){
            video_objects.push(new Playr(v, video_tags[v]));
        }    
    }
}