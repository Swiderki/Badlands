import bpy
import math
from PIL import Image
import os

# Get or create camera
camera = bpy.data.objects.get("Camera")
if not camera:
    camera = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
    bpy.context.scene.collection.objects.link(camera)

# Get or create a Sun light
light = bpy.data.objects.get("Iso_Light")
if not light:
    light_data = bpy.data.lights.new(name="Iso_Light", type='SUN')
    light = bpy.data.objects.new(name="Iso_Light", object_data=light_data)
    bpy.context.scene.collection.objects.link(light)

# Position the light (angled similar to camera for soft shadows)
light.location = (10, -10, 10)
light.rotation_euler = (math.radians(35.264), 0, math.radians(45))

# Adjust light properties
light.data.energy = 5  # Increase intensity if too dark
light.data.angle = math.radians(5)  # Softer shadows
light.data.use_shadow = True  # Enable shadows



# Set camera to orthographic
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 6  # Adjust for your model

# Set isometric rotation
camera.rotation_euler = (
    math.radians(35.264),  # Tilt down
    0,
    math.radians(45)  # Rotate for isometric view
)


# Target the car model
car = bpy.data.objects.get("car-model")

camera.location = (10, -10, 10)  # Keep fixed position
camera.rotation_euler = (math.radians(35.264), 0, math.radians(45))  # Fixed isometric view

# Set as active camera
bpy.context.scene.camera = camera

# OUTPUT SETTINGS
output_folder = bpy.path.abspath("//sprites")
os.makedirs(output_folder, exist_ok=True)

# SPRITE SETTINGS
angles = 60  # Number of frames in rotation (e.g., 16 for every 22.5°)
image_size = (80, 80)  # Single sprite size
bpy.context.scene.eevee.taa_render_samples = 1  # Lowest possible for sharp pixels
bpy.context.scene.eevee.taa_samples = 1  # Disable viewport AA
bpy.context.scene.render.film_transparent = True  # Enable transparency



# SET RENDER SETTINGS
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.context.scene.render.resolution_x = image_size[0]
bpy.context.scene.render.resolution_y = image_size[1]

for constraint in car.constraints:
    constraint.mute = True
#camera.constraints.clear()

# RENDER FRAMES
frame_paths = []
for i in range(angles):
    car.rotation_mode = 'XYZ'

    car.animation_data_clear()
    angle = (360 / angles) * i
    car.rotation_euler.z = math.radians(angle)  # Explicitly modify Z rotation
    car.keyframe_insert(data_path="rotation_euler", frame=i)  # Ensure Blender registers the change
    bpy.ops.object.origin_set(type='ORIGIN_CENTER_OF_MASS', center='BOUNDS')
    bpy.context.view_layer.update()  # Force update
    
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.wm.redraw_timer(type='DRAW_WIN_SWAP', iterations=1)
    
    print(car.rotation_euler)
    print(camera.location)
    filename = f"car_{i:02d}.png"
    filepath = os.path.join(output_folder, filename)
    bpy.context.scene.render.filepath = filepath
    bpy.ops.render.render(write_still=True)
    
    frame_paths.append(filepath)

# COMBINE INTO SPRITESHEET
spritesheet_path = os.path.join(output_folder, "spritesheet.png")
sprite_columns = angles  # Single row

images = [Image.open(f) for f in frame_paths]
sheet_width = image_size[0] * sprite_columns
sheet_height = image_size[1]

spritesheet = Image.new("RGBA", (sheet_width, sheet_height))

# Paste images side by side
for idx, img in enumerate(images):
    x_offset = idx * image_size[0]
    spritesheet.paste(img, (x_offset, 0))

spritesheet.save(spritesheet_path)
print(f"Spritesheet saved: {spritesheet_path}")