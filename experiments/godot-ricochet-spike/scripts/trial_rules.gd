extends RefCounted
class_name TrialRules

# The only physics shared with a possible future game port in this spike.
# Kept pure and deterministic for headless, no-device regression checks.
static func reflect(direction: Vector2, normal: Vector2) -> Vector2:
	if direction.length_squared() < 0.00001 or normal.length_squared() < 0.00001:
		return Vector2.ZERO
	return direction.normalized().bounce(normal.normalized()).normalized()

static func medal_for(shots: int, bounces: int) -> String:
	if shots <= 0 or bounces < 0:
		return "NONE"
	if shots == 1 and bounces >= 1:
		return "GOLD"
	if shots <= 3 and bounces >= 1:
		return "SILVER"
	return "BRONZE"
