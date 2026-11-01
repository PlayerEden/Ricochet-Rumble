extends Node2D

# Sector Rebound — Godot 4.7.2 *comparison* spike.
# Small one-screen ricochet exercise, NOT a port of production JavaScript.
const Rules = preload("res://scripts/trial_rules.gd")
const FIELD = Rect2(42.0, 58.0, 876.0, 392.0)
const AIM_PAD = Rect2(53.0, 385.0, 188.0, 130.0)
const FIRE_PAD = Rect2(748.0, 456.0, 165.0, 66.0)
const RESET_PAD = Rect2(807.0, 11.0, 127.0, 36.0)
const SPEED = 170.0
const SHOT_SPEED = 565.0
const SHOT_TTL = 5.0
const MAX_BOUNCES = 5

var player_position := Vector2(140.0, 324.0)
var player_angle := -1.0
var target_position := Vector2(813.0, 134.0)
var target_body: Area2D
var wall_rects: Array[Rect2] = []
var shots := 0
var total_bounces := 0
var cleared := false
var medal := "NONE"
var bullet_active := false
var bullet_position := Vector2.ZERO
var bullet_direction := Vector2.ZERO
var bullet_ttl := 0.0
var bullet_bounces := 0
var aim_touch_index := -1
var stick_vector := Vector2.ZERO
var bullet_trail: Array[Vector2] = []

func _ready() -> void:
	# Arena walls and an offset cover maze; all bodies use Godot 2D physics.
	wall_rects = [
		Rect2(38.0, 54.0, 884.0, 10.0),
		Rect2(38.0, 446.0, 884.0, 10.0),
		Rect2(38.0, 54.0, 10.0, 402.0),
		Rect2(912.0, 54.0, 10.0, 402.0),
		Rect2(327.0, 80.0, 23.0, 286.0),
		Rect2(510.0, 157.0, 23.0, 289.0),
		Rect2(704.0, 245.0, 162.0, 23.0)
	]
	for rect in wall_rects:
		_add_wall(rect)
	_add_target()
	queue_redraw()

func _add_wall(rect: Rect2) -> void:
	var body := StaticBody2D.new()
	body.collision_layer = 1
	body.collision_mask = 0
	body.position = rect.get_center()
	var shape := RectangleShape2D.new()
	shape.size = rect.size
	var collision := CollisionShape2D.new()
	collision.shape = shape
	body.add_child(collision)
	add_child(body)

func _add_target() -> void:
	target_body = Area2D.new()
	target_body.collision_layer = 2
	target_body.collision_mask = 0
	target_body.position = target_position
	var shape := CircleShape2D.new()
	shape.radius = 21.0
	var collision := CollisionShape2D.new()
	collision.shape = shape
	target_body.add_child(collision)
	add_child(target_body)

func _physics_process(delta: float) -> void:
	if cleared:
		return
	var input_axis := Vector2.ZERO
	if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):
		input_axis.x -= 1.0
	if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT):
		input_axis.x += 1.0
	if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):
		input_axis.y -= 1.0
	if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):
		input_axis.y += 1.0
	if stick_vector.length_squared() > 0.02:
		input_axis = stick_vector
	if input_axis.length_squared() > 0.02:
		input_axis = input_axis.normalized()
		player_angle = lerp_angle(player_angle, input_axis.angle(), minf(1.0, delta * 7.0))
		var next := player_position + input_axis * SPEED * delta
		# Deliberately conservative simple movement for this engine comparison.
		if _circle_clear(next, 17.0):
			player_position = next
	if bullet_active:
		_advance_bullet(delta)
	queue_redraw()

func _circle_clear(point: Vector2, radius: float) -> bool:
	if not FIELD.grow(-radius).has_point(point):
		return false
	for wall in wall_rects:
		if wall.grow(radius).has_point(point):
			return false
	return true

func _advance_bullet(delta: float) -> void:
	bullet_ttl -= delta
	if bullet_ttl <= 0.0:
		bullet_active = false
		return
	var remaining := SHOT_SPEED * delta
	var space := get_world_2d().direct_space_state
	for step_index in range(4):
		if remaining < 0.01 or not bullet_active:
			break
		var origin := bullet_position
		var end := origin + bullet_direction * remaining
		var query := PhysicsRayQueryParameters2D.create(origin, end, 3)
		query.collide_with_areas = true
		var impact := space.intersect_ray(query)
		if impact.is_empty():
			bullet_position = end
			break
		var point: Vector2 = impact["position"]
		if impact["collider"] == target_body:
			bullet_position = point
			bullet_active = false
			cleared = true
			medal = Rules.medal_for(shots, total_bounces)
			break
		var normal: Vector2 = impact["normal"]
		var travelled := origin.distance_to(point)
		remaining = maxf(0.0, remaining - travelled)
		bullet_direction = Rules.reflect(bullet_direction, normal)
		bullet_position = point + normal * 1.5
		bullet_bounces += 1
		total_bounces += 1
		if bullet_bounces > MAX_BOUNCES:
			bullet_active = false
			break
	bullet_trail.push_back(bullet_position)
	if bullet_trail.size() > 24:
		bullet_trail.pop_front()

func fire() -> void:
	if cleared or bullet_active:
		return
	shots += 1
	bullet_bounces = 0
	bullet_ttl = SHOT_TTL
	bullet_direction = Vector2.RIGHT.rotated(player_angle)
	bullet_position = player_position + bullet_direction * 23.0
	bullet_trail.clear()
	bullet_active = true
	queue_redraw()

func reset_trial() -> void:
	shots = 0
	total_bounces = 0
	cleared = false
	medal = "NONE"
	bullet_active = false
	bullet_trail.clear()
	player_position = Vector2(140.0, 324.0)
	player_angle = -1.0
	stick_vector = Vector2.ZERO
	aim_touch_index = -1
	queue_redraw()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_SPACE or event.keycode == KEY_ENTER:
			fire()
		elif event.keycode == KEY_R:
			reset_trial()
	elif event is InputEventScreenTouch:
		if event.pressed:
			if AIM_PAD.has_point(event.position):
				aim_touch_index = event.index
				_update_aim_touch(event.position)
			elif FIRE_PAD.has_point(event.position):
				fire()
			elif RESET_PAD.has_point(event.position):
				reset_trial()
		elif event.index == aim_touch_index:
			aim_touch_index = -1
			stick_vector = Vector2.ZERO
	elif event is InputEventScreenDrag and event.index == aim_touch_index:
		_update_aim_touch(event.position)
	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		if FIRE_PAD.has_point(event.position):
			fire()
		elif RESET_PAD.has_point(event.position):
			reset_trial()

func _update_aim_touch(where: Vector2) -> void:
	var center := AIM_PAD.get_center()
	stick_vector = (where - center).limit_length(49.0) / 49.0

func _draw() -> void:
	var font := ThemeDB.fallback_font
	draw_rect(Rect2(0.0, 0.0, 960.0, 540.0), Color("#151a1e"))
	draw_rect(FIELD, Color("#273238"), true)
	# Clean fixed-size 2D geometry, no fake perspective or new art pipeline.
	for wall in wall_rects:
		draw_rect(wall, Color("#738087"), true)
		draw_rect(wall, Color("#98abb2"), false, 1.3)
	draw_circle(target_position, 27.0, Color("#1d4c4a"))
	draw_arc(target_position, 25.0, 0.0, TAU, 36, Color("#92e9bd"), 3.0)
	draw_circle(target_position, 13.0, Color("#e6c478"))
	# The polygon moves and rotates as one genuine top-down vehicle.
	draw_set_transform(player_position, player_angle)
	draw_rect(Rect2(-20.0, -15.0, 40.0, 30.0), Color("#b9d1d0"))
	draw_rect(Rect2(-20.0, -17.0, 40.0, 5.0), Color("#4b555b"))
	draw_rect(Rect2(-20.0, 12.0, 40.0, 5.0), Color("#4b555b"))
	draw_rect(Rect2(-5.0, -5.0, 34.0, 10.0), Color("#edbc62"))
	draw_circle(Vector2.ZERO, 9.0, Color("#667d86"))
	draw_set_transform(Vector2.ZERO, 0.0)
	if bullet_trail.size() > 1:
		for i in range(1, bullet_trail.size()):
			draw_line(bullet_trail[i-1], bullet_trail[i], Color("#ffcf7d", 0.32), 2.0)
	if bullet_active:
		draw_circle(bullet_position, 5.5, Color("#ffcf7d"))
	draw_rect(Rect2(0.0, 0.0, 960.0, 54.0), Color("#1c242a"))
	draw_string(font, Vector2(52.0, 35.0), "SECTOR REBOUND / GODOT TEST RANGE", HORIZONTAL_ALIGNMENT_LEFT, -1, 20, Color("#f1d290"))
	draw_string(font, Vector2(517.0, 35.0), "SHOTS %d   BOUNCES %d" % [shots, total_bounces], HORIZONTAL_ALIGNMENT_LEFT, -1, 17, Color("#d6e3e5"))
	draw_rect(RESET_PAD, Color("#354047"), true)
	draw_string(font, Vector2(825.0, 35.0), "RESTART", HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Color("#e1e8ea"))
	draw_rect(AIM_PAD, Color("#28333b", 0.90), true)
	draw_circle(AIM_PAD.get_center(), 40.0, Color("#43555d", 0.65))
	draw_circle(AIM_PAD.get_center() + stick_vector * 38.0, 18.0, Color("#8cbabc"))
	draw_string(font, Vector2(68.0, 505.0), "MOVE / AIM", HORIZONTAL_ALIGNMENT_LEFT, -1, 15, Color("#edf1eb"))
	draw_rect(FIRE_PAD, Color("#f4c573"))
	draw_string(font, Vector2(797.0, 495.0), "FIRE", HORIZONTAL_ALIGNMENT_LEFT, -1, 26, Color("#17232a"))
	if cleared:
		draw_rect(Rect2(290.0, 174.0, 380.0, 125.0), Color("#121a1d", 0.95))
		draw_rect(Rect2(290.0, 174.0, 380.0, 125.0), Color("#edc16b"), false, 2.0)
		draw_string(font, Vector2(323.0, 217.0), "TARGET CLEARED · %s" % medal, HORIZONTAL_ALIGNMENT_LEFT, -1, 27, Color("#f0d38f"))
		draw_string(font, Vector2(323.0, 263.0), "RESTART TO TRY A NEW ANGLE", HORIZONTAL_ALIGNMENT_LEFT, -1, 17, Color("#c3d1d3"))
	else:
		draw_string(font, Vector2(290.0, 502.0), "Bank a shot around cover · one shell at a time", HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Color("#c7d3d5"))
