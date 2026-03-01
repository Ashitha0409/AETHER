using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class AntiGravityDrone : MonoBehaviour
{
    [Header("Flight Parameters")]
    public float hoverForce = 9.81f; // Force to counteract gravity
    public float baseMovementForce = 15f;
    public float baseTurnSpeed = 2f;
    public float baseAvoidanceStrength = 50f;

    [Header("AI Configuration")]
    [Range(0, 1)]
    public float riskLevel = 0.5f; // 0 = Safe (Avoidance priority), 1 = Rush (Goal priority)

    [Header("Sensors")]
    public float sensorDistance = 10f;
    public float sensorRadius = 0.5f;
    public LayerMask obstacleLayer;

    private Rigidbody rb;
    private Vector3 targetPosition;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
        rb.useGravity = false; // Important for anti-gravity feel
        rb.drag = 1.5f;
        rb.angularDrag = 2.0f;
    }

    public void SetRisk(float value)
    {
        riskLevel = Mathf.Clamp01(value);
    }

    public void SetTarget(Vector3 position)
    {
        targetPosition = position;
    }

    void FixedUpdate()
    {
        // 1. Hover Force (Anti-gravity)
        rb.AddForce(Vector3.up * hoverForce, ForceMode.Acceleration);

        // 2. Compute dynamic weights based on riskLevel
        // Safe (0): High avoidance, low speed
        // Rush (1): Low avoidance, high speed
        float moveForceMultiplier = Mathf.Lerp(1.0f, 2.5f, riskLevel);
        float avoidanceWeight = Mathf.Lerp(1.0f, 0.2f, riskLevel);
        float goalWeight = Mathf.Lerp(0.5f, 2.0f, riskLevel);

        // 3. Goal Seeking Force
        Vector3 directionToGoal = (targetPosition - transform.position).normalized;
        Vector3 goalForce = directionToGoal * baseMovementForce * goalWeight * moveForceMultiplier;

        // 4. Obstacle Avoidance Force
        Vector3 avoidanceForce = ComputeObstacleAvoidance() * baseAvoidanceStrength * avoidanceWeight;

        // 5. Total Combined Force
        Vector3 finalForce = goalForce + avoidanceForce;
        rb.AddForce(finalForce, ForceMode.Force);

        // 6. Heading Rotation
        if (finalForce.magnitude > 0.1f)
        {
            Quaternion targetRotation = Quaternion.LookRotation(finalForce, Vector3.up);
            rb.MoveRotation(Quaternion.Slerp(transform.rotation, targetRotation, Time.fixedDeltaTime * baseTurnSpeed));
        }
    }

    private Vector3 ComputeObstacleAvoidance()
    {
        Vector3 totalAvoidance = Vector3.zero;
        
        // Sphere casts in multiple directions
        Vector3[] sensorDirections = {
            transform.forward,
            transform.forward + transform.right,
            transform.forward - transform.right,
            transform.right,
            -transform.right,
            transform.forward + transform.up,
            transform.forward - transform.up
        };

        foreach (var dir in sensorDirections)
        {
            RaycastHit hit;
            if (Physics.SphereCast(transform.position, sensorRadius, dir, out hit, sensorDistance, obstacleLayer))
            {
                // Force away from obstacle, inversely proportional to distance
                float proximity = 1.0f - (hit.distance / sensorDistance);
                totalAvoidance -= dir * proximity;
            }
        }

        return totalAvoidance.normalized;
    }

    void OnDrawGizmos()
    {
        // Visualize sensors for demo debug
        Gizmos.color = Color.cyan;
        Gizmos.DrawRay(transform.position, transform.forward * sensorDistance);
        
        Gizmos.color = Color.red;
        if (Application.isPlaying) {
             Gizmos.DrawWireSphere(targetPosition, 1f);
        }
    }
}
