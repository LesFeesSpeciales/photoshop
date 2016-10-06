/* Copyright ou © ou Copr.
François Grassard for "Les Fées Spéciales"
V1.0 - 5 Octobre 2016 (2016/10/05)

This software is a computer program whose purpose is to extract layer from a PSD file and extract them
to the disk in PNG format. This script must be executed in Photoshop itself.

This software is governed by the [CeCILL|CeCILL-B|CeCILL-C] license under French law and
abiding by the rules of distribution of free software.  You can  use, 
modify and/ or redistribute the software under the terms of the [CeCILL|CeCILL-B|CeCILL-C]
license as circulated by CEA, CNRS and INRIA at the following URL
"http://www.cecill.info". 

As a counterpart to the access to the source code and  rights to copy,
modify and redistribute granted by the license, users are provided only
with a limited warranty  and the software's author,  the holder of the
economic rights,  and the successive licensors  have only  limited
liability. 

In this respect, the user's attention is drawn to the risks associated
with loading,  using,  modifying and/or developing or reproducing the
software by the user in light of its specific status of free software,
that may mean  that it is complicated to manipulate,  and  that  also
therefore means  that it is reserved for developers  and  experienced
professionals having in-depth computer knowledge. Users are therefore
encouraged to load and test the software's suitability as regards their
requirements in conditions enabling the security of their systems and/or 
data to be ensured and,  more generally, to use and operate it in the 
same conditions as regards security. 

The fact that you are presently reading this means that you have had
knowledge of the [CeCILL|CeCILL-B|CeCILL-C] license and that you accept its terms.*/



// --------------------------------------
// Main function who export layers to PNG
// --------------------------------------
function _LFS_exportPSDLayersToPNG()
{
	var theDoc = app.activeDocument; // Get the active document name
	var folderName = theDoc.name.replace(/\..+$/, '');  // Remove the *.psd extension from the active document name
	var pathToTheFile = app.activeDocument.path+'/'+folderName;
	var layersPrefix = folderName+"-"; // Add a dash after the name of the document
	var allLayersList = createLayersTree(theDoc); // Collect all layers name
	var layerCount = allLayersList.length; // Number of Layer in PSD file
	var windowsContent = ""; // Placeholder for the UI content
	
	windowsContent = "window{text:'Exporting each layer to PNG images',bounds:[100,100,800,160],"
	windowsContent += "bar:Progressbar{bounds:[20,10,680,50] , value:0,maxvalue:100}";
	windowsContent += "};" // Filling the UI;
	
	hideAllLayers();
	
	var win = new Window(windowsContent); // Creation of the main window with a simple progress bar

	win.center();
	win.show();
	
	for (var i = 0; i < layerCount; i++)
	{
		allLayersList[i].visible = 1; // Show one layer
		savePNGImage(layersPrefix+allLayersList[i].name,pathToTheFile); // Save it PNG
		win.bar.value = (i+1)*(100/layerCount); // Update the progress bar
		win.text = 'Exporting layer "'+allLayersList[i].name+'" to PNG image ('+(i+1)+'/'+layerCount+'). In progress ... please wait.'; // Update title of the window
		app.refresh(); // Force the refresh of photoshop interface
		allLayersList[i].visible = 0; // hide on layer
	}
	showAllLayers();
	win.close();
}


// ---------------------------------
// List all 'ArtLayers' in the stack
// ---------------------------------
function createLayersTree(document)
{
	var list = []; //Create an array to store each object

	for (var i = 0; i < document.layers.length; i++)
	{
		if (document.layers[i].typename == 'ArtLayer')  //Filter to only list layers of "ArtLayer" type;
		{
			list.push (document.layers[i]); // Fill the list
		}
	}
	return list; // Return the array
}


// ---------------------------------------------------------------------------------
// Switch visibility of all layers to "On" using "actions" (to speed up the process)
// ---------------------------------------------------------------------------------
function showAllLayers()
{
		var doc = activeDocument;
	
		var ref = new ActionReference();
		ref.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
		var desc = new ActionDescriptor();
		desc.putReference(cTID('null'), ref);
		executeAction(sTID('selectAllLayers'), desc, DialogModes.NO);
	
		var ref = new ActionReference();
		ref.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
		var list = new ActionList();
		list.putReference(ref);
		var desc = new ActionDescriptor();
		desc.putList(cTID('null'), list);
		executeAction(cTID('Shw '), desc, DialogModes.NO);

		var background = doc.layers[doc.layers.length -1];
		if (background.isBackgroundLayer)
		{
			background.visible = true;
		}
}


// ---------------------------------------------------------------------------------
// Switch visibility of all layers to "Off" using "actions" (to speed up the process)
// ---------------------------------------------------------------------------------
function hideAllLayers() {
	var doc = app.activeDocument;
	
	var ref = new ActionReference();
	ref.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
	var desc = new ActionDescriptor();
	desc.putReference(cTID('null'), ref);
	executeAction(sTID('selectAllLayers'), desc, DialogModes.NO);
	
	var ref = new ActionReference();
	ref.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
	var list = new ActionList();
	list.putReference(ref);
	var desc = new ActionDescriptor();
	desc.putList(cTID('null'), list);
	executeAction(cTID('Hd  '), desc, DialogModes.NO);

	var background = doc.layers[doc.layers.length -1];
	if (background.isBackgroundLayer) {
		background.visible = false;e
	}
}

// ------------------------------------
// Save the document to a new PNG image
// ------------------------------------
function savePNGImage(nameOfFile,pathToTheFile)
{
	var folderToCreate = Folder(pathToTheFile); // Define the path to the new folder
	var theFullAbsolutePath = pathToTheFile+"/"+nameOfFile+".png"; // Define the full path to the new PNG file
	var opts; // Prepare export options

	if(!folderToCreate.exists)
	{
		folderToCreate.create(); // Create the folder if not existing
	}

	opts = new ExportOptionsSaveForWeb();
	opts.format = SaveDocumentType.PNG; // Define type "PNG"
	opts.PNG8 = false; // Because we want a "PNG24" (in fact "PNG32" because we want to keep the Alpha channel)
	opts.transparency = true; // True by default but ... just to be sure

	pngFile = new File(theFullAbsolutePath); // Define a new file object
	app.activeDocument.exportDocument(pngFile, ExportType.SAVEFORWEB, opts); // Now, it's time to export the PNG for good
}


// ---------------------------------------------------------------
// Photoshop utilities : Convert "charID" to "TypeID" and reversly
// ---------------------------------------------------------------
function cTID(s) {return app.charIDToTypeID(s);}
function sTID(s) {return app.stringIDToTypeID(s);}

_LFS_exportPSDLayersToPNG(); // Finaly ... execute the script