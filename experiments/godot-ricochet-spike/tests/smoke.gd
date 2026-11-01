extends SceneTree
const Rules = preload("res://scripts/trial_rules.gd")
const Trial = preload("res://scenes/trial.tscn")

func _initialize() -> void:
	call_deferred("_check")

func _expect(condition: bool, description: String) -> bool:
	if not condition:
		push_error("GODOT_SPIKE_SMOKE_FAIL: " + description)
	return condition

func _check() -> void:
	var ok := true
	var reflected: Vector2 = Rules.reflect(Vector2.RIGHT, Vector2.LEFT)
	ok = _expect(reflected.distance_to(Vector2.LEFT) < 0.00001, "reflection of east into west wall") and ok
	ok = _expect(Rules.medal_for(1, 1) == "GOLD", "gold for one successful bank-shot") and ok
	ok = _expect(Rules.medal_for(2, 2) == "SILVER", "silver for few-shot bank-shot") and ok
	ok = _expect(Rules.medal_for(4, 0) == "BRONZE", "bronze for normal completion") and ok
	var trial := Trial.instantiate()
	root.add_child(trial)
	await process_frame
	ok = _expect(trial.wall_rects.size() == 7, "seven genuine physical 2D walls") and ok
	ok = _expect(trial.target_body != null, "one actual physics target") and ok
	ok = _expect(trial.shots == 0 and not trial.bullet_active, "empty initial attempt") and ok
	trial.fire()
	ok = _expect(trial.shots == 1 and trial.bullet_active, "fire starts precisely one shell") and ok
	trial.fire()
	ok = _expect(trial.shots == 1, "one shell active at a time") and ok
	trial.reset_trial()
	ok = _expect(trial.shots == 0 and not trial.bullet_active and not trial.cleared, "restart clears attempt") and ok
	if ok:
		print("GODOT_RICOCHET_SPIKE_HEADLESS_SMOKE_PASS: scene, 2D collisions, shot cap, medal rules, reset")
	quit(0 if ok else 1)
